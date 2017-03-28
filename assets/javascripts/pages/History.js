import React, { Component, PropTypes as T } from 'react'
import { push } from 'react-router-redux'
import { connect } from 'react-redux'

import { fetchPuzzleRecords } from '../actions/FetchActions'
import { setRecordTypeFilter } from '../actions/Actions'

import RecordList from '../presentations/RecordList'
import ReactPaginate from 'react-paginate'

//import {Row, Col, Dropdown, Glyphicon} from 'react-bootstrap'
import {Dropdown, Glyphicon} from 'react-bootstrap'

import { StyleSheet, css } from 'aphrodite'

class History extends Component {

  state = {
    filterOpen: false,
  }

  static propTypes = {
    location: T.object.isRequired,
    dispatch: T.func.isRequired,
    records: T.object.isRequired,
    recordTypeFilter: T.string.isRequired,
  }

  static contextTypes = {
    auth: T.object.isRequired,
  }

  constructor(props) {
    super(props)
  }

  handleToggle() {
    this.setState({filterOpen: !this.state.filterOpen})
  }

  getRecordData(page = 1, recordType = 'all') {
    const { dispatch } = this.props
    const { auth } = this.context
    let profile = auth.getProfile()
    if (auth.loggedIn()) {
      dispatch(fetchPuzzleRecords({
        page: page,
        user_id: profile.user_id,
        record_type: recordType,
      }))
    }
  }

  handlePageClick(data) {
    let { query } = this.props.location
    let page = data.selected + 1
    this.getRecordData(page, query.type)
    this.props.dispatch(push(`/records?page=${page}&type=${query.type || 'all'}`))
  }

  handleSeeMore(recordType) {
    let { query } = this.props.location
    this.setState({filterOpen: false})
    this.props.dispatch(setRecordTypeFilter(recordType))
    this.getRecordData(query.page, recordType)
    this.props.dispatch(push(`/records?page=${query.page || 1}&type=${recordType}`))
  }

  componentWillMount() {
    let { query } = this.props.location
    this.props.dispatch(setRecordTypeFilter(query.type || 'all'))
    this.getRecordData(query.page || 1, query.type || 'all')
  }

  render() {
    let recordList, pagination, page = 0
    let { query } = this.props.location
    let { records, recordTypeFilter } = this.props
    if (query && query.page) {
      page = parseInt(query.page - 1)
    }
    if (records.data !== undefined) {
      recordList = <RecordList recordList={records.data.data} />
      let pageCount = records.data.total_pages
      if (pageCount > 1) {
        pagination = <ReactPaginate disableInitialCallback={true}
                                    initialPage={page}
                                    previousLabel={'previous'}
                                    nextLabel={'next'}
                                    breakLabel={<a href="">...</a>}
                                    breakClassName={'break-me'}
                                    pageCount={pageCount}
                                    marginPagesDisplayed={2}
                                    pageRangeDisplayed={10}
                                    onPageChange={::this.handlePageClick}
                                    containerClassName={'pagination'}
                                    subContainerClassName={'pages pagination'}
                                    activeClassName={'active'} />
      }
    } else {
      recordList = <h3><b>You must login to access this page.</b></h3>
    }
    return (
      <div>
        <div className="page-nav">
          <Dropdown id="filterMenu" title="filter-menu" className="filter" open={this.state.filterOpen} onToggle={::this.handleToggle}>
            <Dropdown.Toggle>
              <Glyphicon className="filter-icon" glyph="filter" />
            </Dropdown.Toggle>
            <Dropdown.Menu className="super-colors">
              <div className="popover-title">Date Range</div>
              <div className="popover-content">
                <ul className="tags">
                  <li onClick={this.handleSeeMore.bind(this, 'all')} className={`tag ${recordTypeFilter === 'all' ? 'active' : ''}`}>All</li>
                  <li onClick={this.handleSeeMore.bind(this, 'right')} className={`tag ${recordTypeFilter === 'right' ? 'active' : ''}`}>Right</li>
                  <li onClick={this.handleSeeMore.bind(this, 'wrong')} className={`tag ${recordTypeFilter === 'wrong' ? 'active' : ''}`}>Wrong</li>
                </ul>
              </div>
            </Dropdown.Menu>
          </Dropdown>
          <ul className="page-subnav">
            <li><a title="Record Type">{`Record Type: ${recordTypeFilter}`}</a></li>
          </ul>
        </div>
        <div className={css(styles.historyContainer)}>
          <div className={css(styles.right)}>
            <div className={css(styles.listContainer)}>
              { recordList }
            </div>
            <div className={css(styles.pageContainer)}>
               { pagination }
            </div>
          </div>
        </div>
			</div>
    )
  }
}

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: 'center',
    flexDirection: 'column',
  },

  historyContainer: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'row',
  },

  titleContainer: {
    display: 'flex',
    fontSize: '24px',
    fontWeight: 'bold',
  },

  leftMenu: {
    marginTop: '10px',
    flex: '0 0 250px',
    height: '600px'
  },

  right: {
    marginLeft: '40px',
  },

  icon: {
    fontSize: '38px',
  },

  title: {
    marginLeft: '5px',
    lineHeight: '38px',
  },

  listContainer: {
    display: 'flex',
  },

  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
  }

})

function select(state) {
  return {
    records: state.puzzleRecords,
    recordTypeFilter: state.recordTypeFilter,
  }
}

export default connect(select)(History)
