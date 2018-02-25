import React from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  View,
} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome'

import { BarContainer, BAR_POSITIONS } from './BarContainer';

const BUTTON_WIDTH = 40;

export default class TopBar extends React.Component {

  static propTypes = {
    displayed: PropTypes.bool,
    title: PropTypes.string,
    height: PropTypes.number,
    backTitle: PropTypes.string,
    backImage: PropTypes.any,
    onBack: PropTypes.func,
    onSideBar: PropTypes.func,
    onCamera: PropTypes.func,
    onGrid: PropTypes.func,
    displaySideBarButton: PropTypes.bool,
    displayCameraButton: PropTypes.bool,
    displayGridButton: PropTypes.bool,
  };

  static defaultProps = {
    displayed: false,
    title: '',
    backTitle: 'Back',
    backImage: require('../../Assets/angle-left.png'),
    displaySideBarButton: true,
    displayCameraButton: true,
    displayGridButton: true,
    onSidebar: () => {},
    onGrid: () => {},
    onCamera: () => {},
  };

  renderBackButton() {
    const { onBack, backImage } = this.props;

    // do not display back button if there isn't a press handler
    if (onBack) {
      return (
        <TouchableOpacity style={styles.backContainer} onPress={onBack}>
          <Image source={backImage} />
          {Platform.OS === 'ios' &&
            <Text style={[styles.text, styles.backText]}>
              {this.props.backTitle}
            </Text>}
        </TouchableOpacity>
      );
    }

    return null;
  }
//
  _renderGridButton() {
    const { displayGridButton, onGrid } = this.props;

    if (displayGridButton) {
      return (
        <TouchableOpacity style={[styles.button, { flex: 0 }]} onPress={onGrid}>
          <FontAwesome name="th" size={25} color="white" />
        </TouchableOpacity>
      );
    }
    return null;
  }
//

  _renderOpenSideBar() {
    const { displaySideBarButton, onSideBar } = this.props;
    if(displaySideBarButton) {
      return(
        <TouchableOpacity style={[styles.button, {flex: 0}]} onPress={onSideBar}>
          <FontAwesome name="navicon" size={25} color="white"/>
        </TouchableOpacity>
      );
    }
    return null;
  }
//
  _renderOpenCamera() {
    const { displayCameraButton, onCamera } = this.props;
    if(displayCameraButton) {
      return(
        <TouchableOpacity style={[styles.button, {flex: 0}]} onPress={onCamera}>
          <FontAwesome name="camera-retro" size={25} color="white"/>
        </TouchableOpacity>
      );
    }
    return null;
  }
//
  render() {
    const {
      displayed,
      title,
      height,
    } = this.props;

    return (
      <BarContainer
        style={styles.container}
        displayed={displayed}
        height={height}
      >
        <View style={styles.buttonContainer}>
          <View style={styles.buttonSubContainer}>
            {this._renderOpenSideBar()}
          </View>
          <View style={styles.buttonSubContainer}>
            {this._renderGridButton()}
            {this._renderOpenCamera()}
          </View>
        </View>
      </BarContainer>
    );//
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  buttonSubContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    alignItems: 'center',
    width: BUTTON_WIDTH,
  },
  text: {
    fontSize: 16,
    color: 'white',
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  backContainer: {
    position: 'absolute',
    flexDirection: 'row',
    left: 0,
    top: 16,
  },
  backText: {
    paddingTop: 14,
    marginLeft: -10,
  },
  buttonImage: {
    marginTop: 8,
  },
});
