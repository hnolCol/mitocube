import React from "react";
import { Omnibar } from "@blueprintjs/select";
import { MenuItem } from "@blueprintjs/core";
import { OmnibarItem } from "./OmnibarItem";
import axios from "axios";


import _ from "lodash"


const initialState = { isOpen: false, items: []};

class OmnibarSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    
    this.handleClose = this.handleClose.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.filterItems = this.filterItems.bind(this);
    this._asyncDataFetch = this._asyncDataFetch.bind(this);

  }
  componentDidMount () {

    this._asyncDataFetch()
    } 


  componentDidUpdate(prevProps) {
      // Typical usage (don't forget to compare props):
      
      if (!_.isEqual(prevProps.filter,this.props.filter)){
        this._asyncDataFetch()
      }
    }

  _asyncDataFetch() {

        axios.post("/api/features/details", 
        {filter:this.props.filter}, 
        {headers : {'Content-Type': 'application/json'}})
            .then(response => {
                
                this.setItems(JSON.parse(response.data["params"]))})
    }

  setItems(items){
    this.setState({items:items})
  }

  renderItem(item, { handleClick, modifiers, query }) {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    
    return (
        <OmnibarItem key = {item.Entry} item={item} handleClose = {this.handleClose} onSelect = {this.props.onItemSelect}/>
    );
  }

  filterItems(searchString) {
    
    if (searchString.length < 1) {return []}
                
    const re = new RegExp(_.escapeRegExp(searchString), 'i')
    
    const isMatch = result => re.test(result.Entry) | re.test(result["Protein names"]) | re.test(result["Gene names  (primary )"])
    var filteredItems = _.filter(this.state.items, isMatch)
    if (filteredItems.length > 200){
      filteredItems = filteredItems.slice(1,50)
    }
    return(_.sortBy(filteredItems,"Gene names  (primary )"))
}

 
  handleClose() {
    this.props.setOpenState(false)
  }

  render() {
    return (
      
        <Omnibar
          isOpen={this.props.isOpen}
          noResults={<MenuItem disabled={true} text="No results." />}
          onClose={this.handleClose}
          resetOnSelect={true}
          itemRenderer={this.renderItem}
          items={this.state.items}
          itemListPredicate={this.filterItems}
          inputProps={{ placeholder: this.state.items.length===0?'Zero feature items available. API is loading or filter are excluding all features.':`Search in ${this.state.items.length} items.. (example: Yme1l1, Uniprot ID) `}}
          style={{ position: "absolute", left: "50%"}}
          
        />
    );
  }
  static defaultProps = {
    buttonTex : "Search for Graph",
  }
}
export default OmnibarSearch
