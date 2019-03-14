import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import PropTypes from 'prop-types';
import './App.css';


//Fetching Data
const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '20';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';





const largeColumn = { width: '40%',
};
const midColumn = { width: '30%',
};
const smallColumn = { width: '10%',
};

//  const isSearched = (searchTerm) => (item) =>
//  !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      results:null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
   
  }

  needsToSearchTopStories(searchTerm){
    return !this.state.results[searchTerm];
  }

  onSearchSubmit(event){
    const {searchTerm} = this.state;
    this.setState({searchKey:searchTerm});

    if(this.needsToSearchTopStories(searchTerm)){
      this.fetchSearchTopstories(searchTerm);
    }

    event.preventDefault();
  }

  setSearchTopstories(result){
    const { hits, page } = result;
    const { searchKey, results } = this.state;
    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    
    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({
      results:{
        ...results,
        [searchKey] : {hits: updatedHits,page}
      }
    });
  }

  fetchSearchTopstories(searchTerm,page=0){
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result))
      .catch(e => this.setState({ error: e}));
  }

  componentDidMount(){
    const { searchTerm } = this.state;
    this.setState({searchKey: searchTerm});
    this.fetchSearchTopstories(searchTerm);
  }

  onDismiss(id){
    const {searchKey, results } = this.state;
    const {hits, page }= results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId); 

    this.setState({ 
      results : {
        ...results,
        [searchKey]: {hits:updatedHits, page}
      }     
    });
  }

  onSearchChange(event){
     this.setState({ searchTerm: event.target.value});
  }

  render() {
    //ES6
    const { searchTerm, results, searchKey, error} = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    if(!results) {return null;}
    // if(error){return <p>Something went wrong.</p>}
    return (
      <div className="page">
      {/* Split Up Components */}
        <div className="interactions">        
      <Search 
        value={searchTerm}
        onChange={this.onSearchChange}
        onSubmit={this.onSearchSubmit}
      >Search
      </Search>
      </div>
      { error ? <div className="interactions"> <p>Something went wrong.</p></div>
        : <Table 
        list={list}
        onDismiss={this.onDismiss}
      />
      }
      <div className="interactions">
      <Button onClick={() => this.fetchSearchTopstories(searchKey,page+1)}>
      More
        </Button></div>

      {/* <form>
        <input 
          type="text" 
          value={searchTerm}
          onChange={this.onSearchChange}/>
      </form>
      { this.state.list.filter(isSearched(this.state.searchTerm)).map(item => {
          return (
         <div key={item.objectID}> 
              <span>
                <a href={item.url}>{item.title}</a>
              </span>
              <span>{item.author}</span>
              <span>{item.num_comments}</span>
              <span>{item.points}</span>
              <span>
                <button
                onClick = {() => this.onDismiss(item.objectID)}
                type = "button">Dissmiss
                </button></span>
          </div> );
       })}  */}
      </div>
    );
  }
}

class Search extends Component {
  render(){
    const {value, onChange, onSubmit, children} = this.props;
    return (
      <form onSubmit={onSubmit}>
        
        <input 
          type="text" 
          value={value}
          onChange={onChange}
          />
          <button type="submit">
          {children}
          </button>
      </form>
    );
  }
}

class Table extends Component{
  render(){
    const {list,onDismiss} = this.props;
    return(
      <div className="table">
        { list.map(item => 
         <div key={item.objectID} className="table-row"> 
              <span style={largeColumn}>
                <a href={item.url}>{item.title}</a>
              </span>
              <span style={midColumn}>{item.author}</span>
              <span style={smallColumn}>{item.num_comments}</span>
              <span style={smallColumn}>{item.points}</span>
              <span style={smallColumn}>
                <Button 
                onClick = {() => onDismiss(item.objectID)}
                type = "button"
                className="button-inline">Dissmiss
                </Button></span>
          </div> 
       )}
      </div>

    );
    
  Table.propTypes = {
    list: PropTypes.arrayOf(
      PropTypes.shape({
        objectID: PropTypes.string.isRequired,
        author: PropTypes.string,
        url: PropTypes.string,
        num_comments: PropTypes.number,
        points: PropTypes.number,
      })
    ).isRequired,
    onDismiss: PropTypes.func.isRequired,
  };
  }
}

class Button extends Component{
  render(){
    const{
      onClick,
      className = '',
      children,
    } = this.props;

    return(
      <button
      onClick = {onClick}
      className = {className}
      type="button"
      >
      {children}
      </button>    
    );

    Button.propTypes = {
      onClick: PropTypes.func.isRequired,
      className: PropTypes.string,
      children: PropTypes.node.isRequired,
    };
  }
}

export default App;

export {
  Button,
  Search,
  Table,
};