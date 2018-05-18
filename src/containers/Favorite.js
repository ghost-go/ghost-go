import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import ReactPaginate from 'react-paginate';
import { Link } from 'react-router-dom';
import { StyleSheet, css } from 'aphrodite';
import { List } from 'material-ui/List';
import moment from 'moment';
import Auth from '../common/Auth';

import { fetchFavorites } from '../actions/FetchActions';

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: 'center',
    flexDirection: 'column',
  },

  favoriteContainer: {
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
    height: '600px',
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
  },

});

const style = StyleSheet.create({
  listBox: {
    display: 'flex',
    width: '300px',
    height: '120px',
    float: 'left',
  },

  previewImg: {
    width: '100px',
  },

  title: {
    fontSize: '20px',
  },

  listRight: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px',
  },

  date: {
    marginTop: 'auto',
    marginBottom: '20px',
  },

});

class Favorite extends Component {
  static propTypes = {
    auth: PropTypes.instanceOf(Auth).isRequired,
    location: PropTypes.shape({
      search: PropTypes.string.isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
    favorites: PropTypes.shape({}).isRequired,
  }

  constructor(props) {
    super(props);

    this.handlePageClick = this.handlePageClick.bind(this);
  }

  state = {
    filterOpen: false,
    profile: Auth.getProfile(),
  }

  componentWillMount() {
    this.setState({ profile: {} });
    const { userProfile, getProfile } = this.props.auth;
    const query = new URLSearchParams(this.props.location.search);
    if (!userProfile) {
      getProfile((err, profile) => {
        this.setState({ profile });
        this.fetchFavoriteData(query.get('page') || 1, profile.sub);
      });
    } else {
      this.setState({ profile: userProfile });
      this.fetchFavoriteData(query.get('page') || 1, userProfile.sub);
    }
  }

  fetchFavoriteData(page = 1, sub) {
    const { dispatch } = this.props;
    if (Auth.isAuthenticated()) {
      dispatch(fetchFavorites({
        page,
        user_id: sub,
      }));
    }
  }

  handleToggle() {
    this.setState({ filterOpen: !this.state.filterOpen });
  }

  handlePageClick(data) {
    const page = data.selected + 1;
    this.fetchFavoriteData(page, this.state.profile.sub || this.state.profile.user_id);
    this.props.dispatch(push(`/favorites?page=${page}`));
  }

  handleSeeMore() {
    const query = new URLSearchParams(this.props.location.search);
    this.setState({ filterOpen: false });
    this.getFavoriteData(query.page);
    this.props.dispatch(push(`/favorites?page=${query.get('page') || 1}`));
  }

  render() {
    let recordList;
    let pagination;
    let page = 0;
    const query = new URLSearchParams(this.props.location.search);
    const { favorites } = this.props;
    if (query && query.get('page')) {
      page = parseInt(query.get('page') - 1, 10);
    }
    if (favorites.data !== undefined) {
      if (favorites.data.data.length === 0) {
        recordList = <h3><b>No data.</b></h3>;
      } else {
        const pageCount = favorites.data.total_pages;
        recordList = favorites.data.data.map(i => (
          <Link key={`${i.id}`} to={`/problems/${i.id}`}>
            <div className={css(style.listBox)}>
              <div className="list-preview-img">
                <img className={css(style.previewImg)} src={i.preview_img_r1.x200.url} alt="" />
              </div>
              <div className={css(style.listRight)}>
                <span className={css(style.title)}>{`P-${i.id}(${i.rank})`}</span>
                <span>{i.whofirst}</span>
                <span className={css(style.date)}>{moment(i.updated_at).format('YYYY-MM-DD')}</span>
              </div>
            </div>
          </Link>
        ));

        if (pageCount > 1) {
          pagination = (<ReactPaginate
            disableInitialCallback
            initialPage={page}
            previousLabel="previous"
            nextLabel="next"
            breakLabel={<span>...</span>}
            breakClassName="break-me"
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={10}
            onPageChange={this.handlePageClick}
            containerClassName="pagination"
            subContainerClassName="pages pagination"
            activeClassName="active"
          />);
        }
      }
    } else {
      recordList = <h3><b>You must login to access this page.</b></h3>;
    }
    return (
      <div>
        <div className={css(styles.favoriteContainer)}>
          <div className={css(styles.right)}>
            <h1>Favorites</h1>
            <div className={css(styles.listContainer)}>
              <List>
                { recordList }
              </List>
            </div>
            <div className={css(styles.pageContainer)}>
              { pagination }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function select(state) {
  return {
    favorites: state.favorites,
    auth: state.ui.auth,
  };
}

export default connect(select)(Favorite);
