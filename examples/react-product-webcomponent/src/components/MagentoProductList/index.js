import React, { Component } from 'react';
import './ProductList.css';
import gql from 'graphql-tag';
//import { MagentoProductItem } from 'react-router-dom';
import MagentoProductItem from '../MagentoProductItem';

class MagentoProductList extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.id = 'MagentoProductList' + new Date().getUTCMilliseconds();
        this.props.registerGQL({
            query: this.getGQL(),
            callback: this.dataLoaded.bind(this)
        })

        this.state = {
            ProductItems: [
                {
                    imgUrl: "placeholder.jpg",
                    data: {
                        MagentoCatalogProduct: {
                            name: "Loading", price: 0, media_gallery_entries: {
                                file: "test.jpg"
                            }
                        },
                        MagentoStoreStoreConfigs: [{ base_currency_code: "USD", "base_url": "none" }]
                    }
                }
            ]
        }
    }

    dataLoaded(dataPromise) {
        return new Promise((resolve, reject) => {
            dataPromise.then(result => {
                try {
                    var linksAlias = this.id + 'MagentoCatalogCategoryProductLinks';
                    var productItemsAlias = this.id + `MagentoCatalogProductSearchResults`;
                    
                    if (result.data.hasOwnProperty(linksAlias)) {
                        const productSkus = []
                        result.data[linksAlias].map(categoryLink => {
                            productSkus.push(categoryLink.sku);
                        })

                        resolve({
                            query: productItemsAlias + `: MagentoCatalogProductSearchResults(searchCriteria:{
                                filter_groups: {
                                   filters: {
                                    field: "sku",
                                    value: "` + productSkus.join(',') + `",
                                    condition_type: "in"
                                  }
                                },
                                page_size:10,
                                current_page: 0
                            }){
                              items{id, name, price, custom_attributes(
                                  filter:["thumbnail", "url_key"]
                                ){attribute_code, value}}
                            }`,
                            callback: this.dataLoaded.bind(this)
                        })
                    } else if (result.data.hasOwnProperty(productItemsAlias)) {
                        var state = {}
                        state['ProductItems'] = result.data[productItemsAlias].items;
                        this.setState(state)
                        console.log(this.state)
                        resolve(true);
                    } else {
                        reject('Response does not have needed data')
                    }
                } catch (e) {
                    reject(e)
                }
            }).catch(console.log)
        })
    }

    getGQL() {
        return this.id + `MagentoCatalogCategoryProductLinks: MagentoCatalogCategoryProductLinks(categoryId: `+ this.props.categoryId + `) {
            sku, position
        }`
    }

    render() {
        var items = []

        this.state.ProductItems.map(productItem => {
            items.push(<MagentoProductItem data={productItem} />);
        })

        return (
            <div className="block widget block-products-list grid">
                <div className="block-content">
                    <div className="products-grid grid">
                        <ol className="product-items widget-product-grid">
                            {items}
                        </ol>
                    </div>
                </div>
            </div>
        );
    }
}

export default MagentoProductList
