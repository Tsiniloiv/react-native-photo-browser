import React from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome'

import { BarContainer, BAR_POSITIONS } from './BarContainer';

const BUTTON_WIDTH = 40;

export default class BottomBar extends React.Component {

  static propTypes = {
    displayed: PropTypes.bool,
    height: PropTypes.number,
    caption: PropTypes.string,
    displayNavArrows: PropTypes.bool,
    displayGridButton: PropTypes.bool,
    displayActionButton: PropTypes.bool,
    displayDeleteButton: PropTypes.bool,
    displayPlayButton: PropTypes.bool,
    videoIsPlaying: PropTypes.bool,
    onPrev: PropTypes.func,
    onNext: PropTypes.func,
    onGrid: PropTypes.func,
    onAction: PropTypes.func,
    onPlay: PropTypes.func,
  };

  static defaultProps = {
    displayed: false,
    caption: '',
    displayNavArrows: false,
    displayGridButton: false,
    displayActionButton: false,
    displayDeleteButton: true,
    displayPlayButton: false,
    videoIsPlaying: false,
    onPrev: () => {},
    onNext: () => {},
    onGrid: () => {},
    onAction: () => {},
    onDelete: () => {},
    onPlay: () => {},
  };

  _renderNavArrows() {
    const {
      displayNavArrows,
      displayGridButton,
      displayActionButton,
      onPrev,
      onNext,
    } = this.props;
    const missingButtonMargin = BUTTON_WIDTH;
    const arrows = [];

    if (displayNavArrows) {
      // make sure arrows are always at the center of the bar
      // if grid or action buttons are missing
      // note: making grid and action button positions absolute is a nicer way
      // but it's breaking TouchableHiglight for some reason
      // FIX_ME: when you find out a nicer way

      const leftArrow = (
        <TouchableOpacity
          key="left_arrow"
          style={styles.button}
          onPress={onPrev}
        >
          <Image
            source={require('../../Assets/arrow-left.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      );
      const rightArrow = (
        <TouchableOpacity
          key="right_arrow"
          style={styles.button}
          onPress={onNext}
        >
          <Image
            source={require('../../Assets/arrow-right.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      );

      arrows.push(leftArrow, rightArrow);
    }
    return (
      <View style={[styles.arrowContainer, {
        marginRight: displayGridButton ? missingButtonMargin : 0,
        marginLeft: displayActionButton ? missingButtonMargin : 0,
      }]}>
      {arrows}
    </View>
    );
  }
//
  _renderGridButton() {
    const { displayGridButton, onGrid } = this.props;

    if (displayGridButton) {
      return (
        <TouchableOpacity style={[styles.button, { flex: 0 }]} onPress={onGrid}>
          <FontAwesome name="th-large" size={25} color="white" />
        </TouchableOpacity>
      );
    }
    return null;
  }
//

  _renderPlayButton() {
    const {displayPlayButton, onPlay, videoIsPlaying } = this.props;

    if(displayPlayButton) {
      if(videoIsPlaying) {
        return(
          <TouchableOpacity style={[styles.button, {flex: 0}]} onPress={onPlay}>
            <FontAwesome name="play-circle" size={25} color="white"/>
          </TouchableOpacity>
        );
      } else if(!videoIsPlaying) {
        return(
          <TouchableOpacity style={[styles.button, {flex: 0}]} onPress={onPlay}>
            <FontAwesome name="pause-circle" size={25} color="white"/>
          </TouchableOpacity>
        );
      }
    }
    return null;
  }
//

  _renderDeleteButton() {
    const { displayDeleteButton, onDelete } = this.props;

    if(displayDeleteButton) {
      return(
        <TouchableOpacity style={[styles.button, {flex: 0}]} onPress={onDelete}>
          <FontAwesome name="trash" size={25} color="white"/>
        </TouchableOpacity>
      );
    }
    return null;
  }
//
  _renderActionSheet() {
    const { displayActionButton, onAction } = this.props;

    if (displayActionButton) {
      return (
        <TouchableOpacity style={[styles.button, { flex: 0 }]} onPress={onAction}>
          <Image
            source={require('../../Assets/share-button.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      );
    }
    return null;
  }

  render() {
    const { displayed, caption, height } = this.props;

    return (
      <BarContainer
        position={BAR_POSITIONS.BOTTOM}
        displayed={displayed}
        height={height}
        style={styles.container}
      >
        <View style={styles.buttonContainer}>
          {this._renderGridButton()}
          {this._renderNavArrows()}
          {this._renderDeleteButton()}
          {this._renderPlayButton()}
          {this._renderActionSheet()}
        </View>
      </BarContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  captionContainer: {
    flex: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
  },
  caption: {
    color: 'white',
    alignSelf: 'center',
    paddingTop: 8,
  },
  arrowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  button: {
    alignItems: 'center',
    width: BUTTON_WIDTH,
  },
  buttonImage: {
    marginTop: 8,
  },
});
