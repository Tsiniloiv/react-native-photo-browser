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
    displaySideBarButton: PropTypes.bool,
    displayCameraButton: PropTypes.bool,
  };

  static defaultProps = {
    displayed: false,
    title: '',
    backTitle: 'Back',
    backImage: require('../../Assets/angle-left.png'),
    displaySideBarButton: true,
    displayCameraButton: true,
    onSidebar: () => {},
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
  _renderOpenSideBar() {
    const { displaySideBarButton, onSideBar } = this.props;
    if(displaySideBarButton) {
      return(
        <TouchableOpacity style={[styles.button, {flex: 0}]} onPress={onSideBar}>
          <Image
            source={require('../../Assets/angle-left.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      );
    }
    return null;
  }

  _renderOpenCamera() {
    const { displayCameraButton, onCamera } = this.props;
    if(displayCameraButton) {
      return(
        <TouchableOpacity style={[styles.button, {flex: 0}]} onPress={onCamera}>
          <Image
            source={require('../../Assets/small-selected-off.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      );
    }
    return null;
  }

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
          {this._renderOpenSideBar()}
          {this._renderOpenCamera()}
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
    justifyContent: 'center',
    paddingHorizontal: 16,
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
