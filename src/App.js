import React, { Component } from 'react';
import './App.css';


//Fetching Data
const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

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

// const list = [
//   {
//     title: 'React',
//     url: 'https://facebook.github.io/react/',
//     author: 'Jordan Walke',
//     num_comments: 3,
//     points: 4,
//     objectID: 0,
// },
// {
//     title: 'Redux',
//     url: 'https://github.com/reactjs/redux',
//     author: 'Dan Abramov, Andrew Clark',
//     num_comments: 2,
//     points: 5,
//     objectID: 1,
// },
//  ];
//  const isSearched = (searchTerm) => (item) =>
//  !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      result:null,
      searchTerm: DEFAULT_QUERY,
    };

    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
   
  }

  onSearchSubmit(event){
    const {searchTerm} = this.state;
    this.fetchSearchTopstories(searchTerm);
    event.preventDefault();
  }

  setSearchTopstories(result){
    const {hits, page } = result;
    const oldHits = page !== 0
      ? this.state.result.hits
      : [];
    
    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({
      result:{hits: updatedHits,page}});
  }

  fetchSearchTopstories(searchTerm,page=0){
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result));
  }

  componentDidMount(){
    const { searchTerm } = this.state;
    this.fetchSearchTopstories(searchTerm);
  }

  onDismiss(id){

    const isNotId = item => item.objectID !== id;
    const updatedHits = this.state.result.hits.filter(isNotId); 
    this.setState({
      result: Object.assign({}, this.state.result, {hits:updatedHits})
    });

  }

  onSearchChange(event){
     this.setState({ searchTerm: event.target.value});
  }

  render() {
    //ES6
    const { searchTerm, result} = this.state;
    const page = (result && result.page) || 0;
    if(!result) {return null;}
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
      {
        result &&
        <Table 
        list={result.hits}
        onDismiss={this.onDismiss}
      />
      }
      <div className="interactions">
      <Button onClick={() => this.fetchSearchTopstories(searchTerm,page+1)}>
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
  }
}

export default App;
