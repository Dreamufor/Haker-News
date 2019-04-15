import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import './App.css';


//Fetching Data
const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '20';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

//Loading
const Loading = () => 
     <div>Loading...</div>

//HOC
// const withFoo = (Component) => (props) => <Component { ...props } />

// const withLoading = (Component) => (props) =>
//   props.isLoading
//     ? <Loading />
//     : <Component { ...props } />

// const withLoading = (Component) => ({ isLoading, ...rest }) =>
//   isLoading
//     ? <Loading />
//     : <Component { ...rest } />



const largeColumn = { width: '40%',
};
const midColumn = { width: '30%',
};
const smallColumn = { width: '10%',
};

//  const isSearched = (searchTerm) => (item) =>
//  !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};


class App extends Component {
  //构造函数只会在组件初始化时调用一次
  constructor(props){
    //你也可以调用 super(props);，它会在你的构造函数中设置 this.props 以供在构造函数中 访问它们。否则当在构造函数中访问 this.props ，会得到 undefined
    super(props);
    //state 通过使用 this 绑定在类上。因此，你可以在整个组件中访问到 state
    this.state = {
      results:null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSort = this.onSort.bind(this);
   
  }
  onSort(sortKey) {    
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
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
      },
      isLoading: false
    });
  }

  fetchSearchTopstories(searchTerm,page=0){
    this.setState({ isLoading: true});

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
    const { searchTerm, results, searchKey, error, isLoading, sortKey,isSortReverse} = this.state;
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
        sortKey={sortKey} 
        isSortReverse={isSortReverse}
        onSort={this.onSort}
        onDismiss={this.onDismiss}
      />
      }
      <div className="interactions">
        { isLoading ? <Loading/> :  
        <Button onClick={() => this.fetchSearchTopstories(searchKey,page+1)}>   
          More
        </Button>}
        {/* <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
            More
          </ButtonWithLoading>
      */}
   </div>

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

// class Search extends Component {
//   componentDidMount() {
//     if(this.input){
//       this.input.focus();
//     }
//   }
  
//   render(){
//     const {value, onChange, onSubmit, children} = this.props;
//     return (
//       <form onSubmit={onSubmit}>
        
//         <input 
//           type="text" 
//           value={value}
//           onChange={onChange}
//           ref={(node) => {this.input = node;}}
//           />
//           <button type="submit">
//           {children}
//           </button>
//       </form>
//     );
//   }
// }

const Search = ({
  value, onChange, onSubmit, children
}) => {
  let input;
  return (
     <form onSubmit={onSubmit}>
        
        <input 
          type="text" 
          value={value}
          onChange={onChange}
          ref={(node) => input = node}
          />
          <button type="submit">
          {children}
          </button>
      </form>
  )
}

const Sort = ({ sortKey, activeSortKey, onSort, children }) => {
  // const sortClass = ['button-inline'];
  // if (sortKey === activeSortKey) {
  //   sortClass.push('button-active');
  // }
  // return (
  //   <Button
  //     onClick={() => onSort(sortKey)}
  //     className={sortClass.join(' ')}
  //   >
  const sortClass = classNames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey }
    );
    return (
        <Button
          onClick={() => onSort(sortKey)}
          className={sortClass}
    >
      {children}
    </Button>
);
}

const Table = ({
  list, sortKey, isSortReverse,
      onSort,onDismiss
}) => {
    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse
      ? sortedList.reverse()
      : sortedList;

    return(
      <div className="table">
      <div className="table-header">
      <span style={{ width: '40%' }}>
        <Sort
          sortKey={'TITLE'}
          onSort={onSort}
          activeSortKey={sortKey}
        > Title 
        </Sort>
      </span>
      <span style={{ width: '30%' }}>
        <Sort
          sortKey={'AUTHOR'}
          onSort={onSort}
          activeSortKey={sortKey}
        >
        Author
        </Sort>
      </span>
      <span style={{ width: '10%' }}>
        <Sort
          sortKey={'COMMENTS'}
          onSort={onSort}
          activeSortKey={sortKey}
        > Comments
        </Sort>
      </span>
      <span style={{ width: '10%' }}>
        <Sort
          sortKey={'POINTS'}
          onSort={onSort}
          activeSortKey={sortKey}
        >
          Points
        </Sort>
      </span>
      <span style={{ width: '10%' }}>
        Archive
      </span>
      </div>
        {/* { list.map(item =>  */}
          {reverseSortedList.map(item =>
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

// const ButtonWithLoading = withLoading(Button);