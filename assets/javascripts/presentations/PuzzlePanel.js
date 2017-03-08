import React, { Component, PropTypes as T } from 'react'
import { postRating } from '../actions/PostActions'
import Toggle from 'material-ui/Toggle'
import AnswerBar from '../presentations/AnswerBar'

import { StyleSheet, css } from 'aphrodite'
import RankRange from '../presentations/RankRange'
import {Button} from 'react-bootstrap'

export default class PuzzlePanel extends Component {

  static propTypes = {
    puzzle: T.object.isRequired,
    rangeFilter: T.object.isRequired,
    className: T.object,
    params: T.object,
    dispatch: T.func,
    auth: T.object,
    addSteps: T.func,
    resetSteps: T.func,
    handleReset: T.func,
    steps: T.array,
    setCurrentAnswerId: T.func,
    setCurrentMode: T.func,
    currentMode: T.string,
    currentAnswerId: T.number,
    showNext: T.bool,
    handleNext: T.func.isRequired,
    handleRangeChange: T.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      answersExpanded: true,
    }

  }

  handleResearchMode() {
    if (this.props.currentMode === 'answer') {
      this.props.setCurrentMode('research')
    } else {
      this.props.setCurrentMode('answer')
    }
  }

  handleRatingChange(rate) {
    const { auth } = this.props
    let profile = auth.getProfile()
    if (auth.loggedIn()) {
      let { id } = this.props.params
      this.props.dispatch(postRating({
        ratable_id: id,
        ratable_type: 'Puzzle',
        score: rate,
        user_id: profile.user_id
      })).then((promise) => {
        if (promise.type === 'POST_RATING_SUCCESS') {
          this.setState({
            open: true,
            score: rate,
            ratingInfo: promise.payload.data.message || 'Thanks for you rating!'
          })
        }
      })
    } else {
      auth.login()
    }
  }

  render() {
    let puzzle = this.props.puzzle
    if (puzzle === undefined) return null
    let rightAnswers = []
    let wrongAnswers = []
    let nextPanel, nextBtn
    if (this.props.showNext === true) {
      nextBtn =
        <Button
          style={{marginRight: '10px'}}
          onClick={this.props.handleNext}
          bsStyle="info">
          Next Tsumego
        </Button>
      nextPanel = <RankRange rankRange={this.props.rangeFilter} handleRangeChange={this.props.handleRangeChange} ref='range' />
    }
    if (puzzle != null && puzzle.right_answers != null && puzzle.wrong_answers != null) {
      puzzle.right_answers.forEach((i) => {
        rightAnswers.push(
          <AnswerBar
            setCurrentAnswerId={this.props.setCurrentAnswerId}
            addSteps={this.props.addSteps}
            resetSteps={this.props.resetSteps}
            key={i.id}
            id={i.id}
            answer={i.steps}
            steps={this.props.steps}
            currentAnswerId={this.props.currentAnswerId}
            setCurrentMode={this.props.setCurrentMode}
            current={0}
            up={0}
            down={0}
          />
        )
      })
      puzzle.wrong_answers.forEach((i) => {
        wrongAnswers.push(
          <AnswerBar
            setCurrentAnswerId={this.props.setCurrentAnswerId}
            addSteps={this.props.addSteps}
            resetSteps={this.props.resetSteps}
            key={i.id}
            id={i.id}
            answer={i.steps}
            steps={this.props.steps}
            currentAnswerId={this.props.currentAnswerId}
            setCurrentMode={this.props.setCurrentMode}
            current={0}
            up={0}
            down={0}
          />
        )
      })
    }
    return (
      <div className={this.props.className}>
        <div className='title'>{`${puzzle.whofirst} ${puzzle.rank}`}</div>
        <div><strong>Number:</strong>{`P-${puzzle.id}`}</div>
        <div className="button-container">
          <Button
            style={{marginRight: '10px'}}
            onClick={this.props.handleReset}
            bsStyle="primary">
            Reset
          </Button>
          { nextBtn }
        </div>
        <div>
          { nextPanel }
        </div>
        <div className="sharethis-inline-share-buttons"></div>
        <Toggle
          className="research"
          label="Research Mode"
          defaultToggled={this.props.currentMode === 'research'}
          onToggle={::this.handleResearchMode}
        />
        <div className={css(styles.answersContainer)}>
          <div>Right Answers</div>
          { rightAnswers }
          <div>Wrong Answers</div>
          { wrongAnswers }
        </div>
      </div>
    )
  }

}

const styles = StyleSheet.create({

  answersContainer: {
    padding: '0px',
    '@media screen and (max-aspect-ratio: 4/3)': {
      padding: '0px',
    },
  },

})
