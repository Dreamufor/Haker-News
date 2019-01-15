import React, { Component } from 'react';
import './App.css';


//Fetching Data
const DEFAULT_QUERY = 'redux';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';





const largeColumn = { width: '40%',
};
const midColumn = { width: '30%',
};
const smallColumn = { width: '10%',
};

const list = [
  {
    title: 'React',
    url: 'https://facebook.github.io/react/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
},
{
    title: 'Redux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
},
 ];
 const isSearched = (searchTerm) => (item) =>
 !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());

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
    this.onDismiss = this.onDismiss.bind(this);
   
  }

  setSearchTopstories(result){
    this.setState({result});
  }

  fetchSearchTopstories(searchTerm){
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
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
    if(!result) {return null;}
    return (
      <div className="page">
      {/* Split Up Components */}
        <div className="interactions">
      <Search 
        value={searchTerm}
        onChange={this.onSearchChange}
      >Search
      </Search>
      </div>
      <Table 
        list={result.hits}
        pattern={searchTerm}
        onDismiss={this.onDismiss}
      />

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
    const {value, onChange, children} = this.props;
    return (
      <form>
        {children}
        <input 
          type="text" 
          value={value}
          onChange={onChange}
          />
      </form>
    );
  }
}

class Table extends Component{
  render(){
    const {list,pattern,onDismiss} = this.props;
    return(
      <div className="table">
        { list.filter(isSearched(pattern)).map(item => 
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
