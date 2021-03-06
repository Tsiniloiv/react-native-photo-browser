import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Platform,
} from 'react-native';

import * as Progress from 'react-native-progress';
import Video from 'react-native-video';

export default class VideoPlayer extends Component {

  static propTypes = {
    /*
     * image uri or opaque type that is passed as source object to image component
     */
    uri: PropTypes.oneOfType([
      // assets or http url
      PropTypes.string,
      // Opaque type returned by require('./image.jpg')
      PropTypes.number,
    ]).isRequired,

    /*
     * displays a check button above the image
     */
    displaySelectionButtons: PropTypes.bool,

    /*
     * these values are set to image and it's container
     * screen width and height are used if those are not defined
     */
    width: PropTypes.number,
    height: PropTypes.number,


    /*
     * when lazyLoad is true,
     * image is not loaded until 'load' method is manually executed
     */
    lazyLoad: PropTypes.bool,

    /*
     * displays selected or unselected icon based on this prop
     */
    selected: PropTypes.bool,

    /*
     * size of selection images are decided based on this
     */
    thumbnail: PropTypes.bool,

    /*
     * executed when user selects/unselects the photo
     */
    onSelection: PropTypes.func,

    /*
     * image tag generated using require(asset_path)
     */
    progressImage: PropTypes.number,

    /*
     * displays Progress.Circle instead of default Progress.Bar
     * it's ignored when progressImage is also passed.
     * iOS only
     */
    useCircleProgress: PropTypes.bool,

    //Pass a function in this prop to be called.
    endHandler: PropTypes.func,
  };

  static defaultProps = {
    resizeMode: 'contain',
    thumbnail: false,
    lazyLoad: false,
    selected: false,
    endHandler: () => {},
  };

  constructor(props) {
    super(props);

    this._onProgress = this._onProgress.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this._onError = this._onError.bind(this);
    this._onLoad = this._onLoad.bind(this);
    this._toggleSelection = this._toggleSelection.bind(this);
    this._resetVideo = this._resetVideo.bind(this);
    this._playOrPauseVideo = this._playOrPauseVideo.bind(this);
    this.setVideoTimerToBeginning = this.setVideoTimerToBeginning.bind(this);
    this._onVideoPlaybackEnds = this._onVideoPlaybackEnds.bind(this);

    const { lazyLoad, uri } = props;

    this.state = {
      uri: lazyLoad ? null : uri,
      progress: 0,
      error: false,
      rate: 1,
      volume: 1,
      muted: false,
      resizeMode: 'cover',
      duration: 0.0,
      currentTime: 0.0,
      paused: true,
      repeat: false,
      ended: false,
      startPoint: true,
    };
  }

  componentDidUpdate(prevProps,prevState) {
    if (!prevState.ended && this.state.ended){
      this.video.seek(0);
    }
  }

  componentDidMount() {
    if(Platform.OS == 'ios'){
      this.setState({
        repeat: false,
      });
    }
  }

  onProgress(data) {
   this.setState({currentTime: data.currentTime});
  }

  getCurrentTimePercentage() {
    if (this.state.currentTime > 0) {
      return parseFloat(this.state.currentTime) / parseFloat(this.state.duration);
    } else {
      return 0;
    }
  }

  componentWillUnmount() {
    //console.log("Unmounting video component with source " + this.state.uri);
  }

  load() {
    if (!this.state.uri) {
      this.setState({
        uri: this.props.uri,
      });
    }
  }

  setVideoTimerToBeginning() {
    this.video.seek(0);
  }

  _onProgress(event) {
    const progress = event.nativeEvent.loaded / event.nativeEvent.total;
    if (!this.props.thumbnail && progress !== this.state.progress) {
      this.setState({
        progress,
      });
    }
  }

  _onError() {
    this.setState({
      error: true,
      progress: 1,
    });
  }

  _onLoad(data) {

    this._resetVideo();
    this.setState({
      progress: 1,
      duration: data.duration,
    });
  }

  _playOrPauseVideo() {
    if (Platform.OS === 'ios') {
      if (this.state.ended && (this.state.currentTime >= this.state.duration)) {
        this.video.seek(0);
        this.setState({paused: !this.state.paused});
      } else {
        this.setState({paused: !this.state.paused});
      }
    } else if (Platform.OS === 'android') {
      this.setState({paused: !this.state.paused});
    }

  }

  _resetVideo() {
    this.setState({
      paused: true,
    });
    if (Platform.OS === 'android') {
      this.video.seek(0);
    }
  }

  _onVideoPlaybackEnds() {
    if (Platform.OS === 'android') {
      this.setState({
        paused: true,
        ended: true,
      });
      this.video.seek(0);
    }else if (Platform.OS === 'ios') {
      this.setState({
        paused: true,
        ended: true,
      });
    }
    this.props.endHandler();
  }

  _toggleSelection() {
    // onSelection is resolved in index.js
    // and refreshes the dataSource with new media object
    this.props.onSelection(!this.props.selected);
  }

  _renderProgressIndicator() {
    const { progressImage, useCircleProgress } = this.props;
    const { progress } = this.state;

    if (progress < 1) {
      if (progressImage) {
        return (
          <Image
            source={progressImage}
          />
        );
      }

      if (Platform.OS === 'android') {
        return <ActivityIndicator animating={ true }/>;
      }

      const ProgressElement = useCircleProgress ? Progress.Circle : Progress.Bar;
      return (
        <ProgressElement
          progress={progress}
          thickness={20}
          color={'white'}
        />
      );//
    }
    return null;
  }

  _renderErrorIcon() {
    return (
      <Image
        source={require('../../Assets/image-error.png')}
      />
    );
  }

  _renderSelectionButton() {
    const { progress } = this.state;
    const { displaySelectionButtons, selected, thumbnail } = this.props;

    // do not display selection before image is loaded
    if (!displaySelectionButtons || progress < 1) {
      return null;
    }

    let buttonImage;
    if (thumbnail) {
      let icon = require('../../Assets/small-selected-off.png');
      if (selected) {
        icon = require('../../Assets/small-selected-on.png');
      }

      buttonImage = (
        <Image
          source={icon}
          style={styles.thumbnailSelectionIcon}
        />
      ); //
    } else {
      let icon = require('../../Assets/selected-off.png');
      if (selected) {
        icon = require('../../Assets/selected-on.png');
      }

      buttonImage = (
        <Image
          style={styles.fullScreenSelectionIcon}
          source={icon}
        />
      ); //
    }

    return (
      <TouchableWithoutFeedback onPress={this._toggleSelection}>
        {buttonImage}
      </TouchableWithoutFeedback>
    ); //
  }

  render() {
    const { resizeMode, width, height } = this.props;
    const screen = Dimensions.get('window');
    const { uri, error } = this.state;

    let source;
    if (uri) {
      // create source objects for http/asset strings
      // or directly pass uri number for local files
      source = typeof uri === 'string' ? { uri } : uri;
    }

    //Screen landscape double-checker
    var sizeStyle;
    if(screen.width > screen.height) {
      sizeStyle = {
        width: screen.width,
        height: screen.height,
      }
      } else {
        sizeStyle = {
          width: screen.height,
          height: screen.width,
        }
      }

    // i had to get window size and set photo size here
    // to be able to respond device orientation changes in full screen mode
    // FIX_ME: when you have a better option
    //const sizeStyle = {
    //  width: width || screen.width,
    //  height: height || screen.height,
    //};

    return (
      <View style={[styles.container, sizeStyle]}>
        {error ? this._renderErrorIcon() : this._renderProgressIndicator()}
          <Video
            ref={(ref: Video) => {this.video = ref}}
            {...this.props}
            source={source}
            style={styles.image}
            rate={this.state.rate}
            paused={this.state.paused}
            volume={this.state.volume}
            muted={this.state.muted}
            resizeMode={this.state.resizeMode}
            onLoad={this._onLoad}
            onProgress={this.onProgress}
            onEnd={this._onVideoPlaybackEnds}
            playInBackground={false}
            playWhenInactive={false}
            repeat={this.state.repeat}
          />
        {this._renderSelectionButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  thumbnailSelectionIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  fullScreenSelectionIcon: {
    position: 'absolute',
    top: 60,
    right: 16,
  },
  playButtonIcon: {
    position: 'absolute',
    top: '50%',
    right: '50%',
  },
    backgroundVideo: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
  },
});
