import React from 'react';
import PropTypes from 'prop-types';
import {
  DeviceEventEmitter,
  Dimensions,
  ListView,
  View,
  ViewPagerAndroid,
  StyleSheet,
  Platform,
  Text,
  StatusBar,
  TouchableWithoutFeedback,
  TouchableHighlight,
  ViewPropTypes
} from 'react-native';
import Swiper from 'react-native-swiper';
import FontAwesome from 'react-native-vector-icons/FontAwesome'


import Constants from './constants';
import { BottomBar } from './bar';
import { Photo, VideoPlayer } from './media';

export default class FullScreenContainer extends React.Component {

  static propTypes = {
    style: ViewPropTypes.style,
    dataSource: PropTypes.instanceOf(ListView.DataSource).isRequired,
    mediaList: PropTypes.array.isRequired,
    /*
     * opens grid view
     */
    onGridButtonTap: PropTypes.func,

    /*
     * Display top bar
     */
    displayTopBar: PropTypes.bool,

    /*
     * updates top bar title
     */
    updateTitle: PropTypes.func,

    /*
     * displays/hides top bar
     */
    toggleTopBar: PropTypes.func,

    /*
     * refresh the list to apply selection change
     */
    onMediaSelection: PropTypes.func,

    displayDeleteButton: PropTypes.bool,

    /*
     * those props are inherited from main PhotoBrowser component
     * i.e. index.js
     */
    initialIndex: PropTypes.number,
    alwaysShowControls: PropTypes.bool,
    displayActionButton: PropTypes.bool,
    displayNavArrows: PropTypes.bool,
    alwaysDisplayStatusBar: PropTypes.bool,
    displaySelectionButtons: PropTypes.bool,
    enableGrid: PropTypes.bool,
    useCircleProgress: PropTypes.bool,
    onActionButton: PropTypes.func,
    onDeleteButton: PropTypes.func,
    onPhotoLongPress: PropTypes.func,
    delayLongPress: PropTypes.number,
    comingSoonURI: PropTypes.string,
  };

  static defaultProps = {
    initialIndex: 0,
    displayTopBar: false,
    displayNavArrows: false,
    displayDeleteButton: true,
    alwaysDisplayStatusBar: false,
    displaySelectionButtons: false,
    enableGrid: true,
    comingSoonURI: "",
    onGridButtonTap: () => {},
    onPhotoLongPress: () => {},
    delayLongPress: 1000,
  };

  constructor(props, context) {
    super(props, context);

    this._renderRow = this._renderRow.bind(this);
    this._toggleControls = this._toggleControls.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onPageSelected = this._onPageSelected.bind(this);
    this._onNextButtonTapped = this._onNextButtonTapped.bind(this);
    this._onPhotoLongPress = this._onPhotoLongPress.bind(this);
    this._onPreviousButtonTapped = this._onPreviousButtonTapped.bind(this);
    this._onActionButtonTapped = this._onActionButtonTapped.bind(this);
    this._onDeleteButtonTapped = this._onDeleteButtonTapped.bind(this);
    this._onPlayButtonTapped = this._onPlayButtonTapped.bind(this);
    this._onVideoEnd = this._onVideoEnd.bind(this);
    this._buildSwiper = this._buildSwiper.bind(this);
    this._renderPlayButton = this._renderPlayButton.bind(this);

    this.photoRefs = [];
    this.state = {
      currentIndex: props.initialIndex,
      currentMedia: props.mediaList[props.initialIndex],
      controlsDisplayed: props.displayTopBar,
      displayPlayButton: false,
      displayComingSoon: true,
      swiperList: [],
    };
  }

  componentDidMount() {
    this._buildSwiper();
    DeviceEventEmitter.addListener('didUpdateDimensions', () => {
      this.photoRefs.map(p => p && p.forceUpdate());
      this.openPage(this.state.currentIndex, false);
    });

    this.openPage(this.state.currentIndex, false);
  }

  componentWillReceiveProps(nextProps) {
  }

  componentDidUpdate(prevProps, prevState) {
      if(prevProps.mediaList.length != this.props.mediaList.length) {
        this._buildSwiper();
        if(this.props.mediaList[this.state.currentIndex].type === 'video') {
          this.setState({ displayPlayButton: true });
        } else if(this.props.mediaList[this.state.currentIndex].type !== 'video') {
          this.setState({displayPlayButton: false,});
        }
        this.openPage(this.state.currentIndex, false);
      }
  }

  openPage(index, animated) {
    if (!this.scrollView && !this.swiperView) {
      return;
    }
      if (Platform.OS === 'ios'){
        this.swiperView.scrollView.scrollTo({x: index, animated:true});
      }else if (Platform.OS === 'android') {
          this.swiperView.scrollView.setPageWithoutAnimation(index);
      }
      if(!this.state.controlsDisplayed) {
        this._toggleControls();
      }
    this._updatePageIndex(index);
  }

  _updatePageIndex(index) {
    if(this.state.currentMedia.type === 'video' && this.photoRefs[this.state.currentIndex] && this.state.videoIsPlaying) {
      this.photoRefs[this.state.currentIndex]._resetVideo();
      this._onVideoEnd();
    }
    if(this.props.mediaList[index].type === 'video') {
      this.setState({
        currentIndex: index,
        displayPlayButton: true,
        currentMedia: this.props.mediaList[index],
      });
    } else if (this.props.mediaList[index].type !== 'video') {
      this.setState({
        currentIndex: index,
        displayPlayButton: false,
        currentMedia: this.props.mediaList[index],
      });
    }
  }

  _triggerPhotoLoad(index) {
    const photo = this.photoRefs[index];
    if (photo) {
      photo.load();
    } else {
      // HACK: photo might be undefined when user taps a photo from gridview
      // that hasn't been rendered yet.
      // photo is rendered after listView's scrollTo method call
      // and i'm deferring photo load method for that.
      setTimeout(this._triggerPhotoLoad.bind(this, index), 200);
    }
  }

  _toggleControls() {
    const { alwaysShowControls, toggleTopBar } = this.props;

    if (!alwaysShowControls) {
      const controlsDisplayed = !this.state.controlsDisplayed;
      this.setState({
        controlsDisplayed,
      });
      toggleTopBar(controlsDisplayed);
    }
  }

  _onNextButtonTapped() {
    let nextIndex = this.state.currentIndex + 1;
    // go back to the first item when there is no more next item
    if (nextIndex > this.props.dataSource.getRowCount() - 1) {
      nextIndex = 0;
    }
    this.openPage(nextIndex, false);
  }

  _onPreviousButtonTapped() {
    let prevIndex = this.state.currentIndex - 1;
    // go to the last item when there is no more previous item
    if (prevIndex < 0) {
      prevIndex = this.props.dataSource.getRowCount() - 1;
    }
    this.openPage(prevIndex, false);
  }

  _onActionButtonTapped() {
    const onActionButton = this.props.onActionButton;

    // action behaviour must be implemented by the client
    // so, call the client method or simply ignore this event
    if (onActionButton) {
      const { currentMedia, currentIndex } = this.state;
      onActionButton(currentMedia, currentIndex);
    }
  }

  _onDeleteButtonTapped() {
    const onDeleteButton = this.props.onDeleteButton;

    //action behaviour to be implemented by the client
    if (onDeleteButton) {
      const { currentMedia, currentIndex } = this.state;
      onDeleteButton(currentMedia, currentIndex);
    }
  }

  _onPlayButtonTapped() {
    this._toggleControls();
    this.setState({
      videoIsPlaying: !this.state.videoIsPlaying,
    });
    this.photoRefs[this.state.currentIndex]._playOrPauseVideo();
  }

  _on3DButtonTapped() {
    this.setState({displayComingSoon: true});
  }

  _onVideoEnd() {
    this._toggleControls();
    this.setState({ videoIsPlaying: !this.state.videoIsPlaying });
  }

  _onScroll(e) {
    const event = e.nativeEvent;
    const layoutWidth = event.layoutMeasurement.width || Dimensions.get('window').width;
    const newIndex = Math.floor((event.contentOffset.x + 0.5 * layoutWidth) / layoutWidth);

    this._onPageSelected(newIndex);
  }

  _onPageSelected(page) {
    const { currentIndex } = this.state;
    let newIndex = page;

    // handle ViewPagerAndroid argument
    if (typeof newIndex === 'object') {
      newIndex = newIndex.nativeEvent.position;
    }

    if (currentIndex !== newIndex) {
      this._updatePageIndex(newIndex);

      if (!this.state.controlsDisplayed) {
        this._toggleControls();
      }
    }
  }

  _onPhotoLongPress() {
    const onPhotoLongPress = this.props.onPhotoLongPress;
    const { currentMedia, currentIndex } = this.state;
    onPhotoLongPress(currentMedia, currentIndex);
  }

  _renderRow(media: Object, sectionID: number, rowID: number) {
    const {
      displaySelectionButtons,
      onMediaSelection,
      useCircleProgress,
    } = this.props;

    if(media.type === 'photo') {
      return (
        <View key={'row_' + rowID} style={styles.flex}>
          <TouchableWithoutFeedback
            onPress={this._toggleControls}
            onLongPress={this._onPhotoLongPress}
            delayLongPress={this.props.delayLongPress}>
            <Photo
              ref={ref => this.photoRefs[rowID] = ref}
              lazyLoad
              useCircleProgress={useCircleProgress}
              uri={media.photo}
              displaySelectionButtons={displaySelectionButtons}
              selected={media.selected}
              onSelection={(isSelected) => {
                onMediaSelection(rowID, isSelected);
              }}
            />
          </TouchableWithoutFeedback>
        </View>
      );
    } else if(media.type === 'video') {
      return (
        <View key={'row_' + rowID} style={styles.flex}>
          <TouchableWithoutFeedback
            onPress={this._toggleControls}
            onLongPress={this._onPhotoLongPress}
            delayLongPress={this.props.delayLongPress}>
            <VideoPlayer
              ref={ref => this.photoRefs[rowID] = ref}
              lazyLoad
              useCircleProgress={useCircleProgress}
              uri={media.photo}
              displaySelectionButtons={displaySelectionButtons}
              selected={media.selected}
              onSelection={(isSelected) => {
                onMediaSelection(rowID, isSelected);
              }}
            />
          </TouchableWithoutFeedback>
        </View>
      );
    }
  }

  _buildSwiper() {
    const { dataSource,
            mediaList,
            displaySelectionButtons,
            onMediaSelection,
            useCircleProgress, } = this.props;

    var builtList = mediaList.map((item) => {
        if(item.type === 'photo') {
          return(
            <View key={'row_' + mediaList.indexOf(item)} style={styles.flex}>
            <TouchableWithoutFeedback
              onPress={this._toggleControls}
              onLongPress={this._onPhotoLongPress}
              delayLongPress={this.props.delayLongPress}>
              <View>
              <Photo
                ref={ref => this.photoRefs[mediaList.indexOf(item)] = ref}
                useCircleProgress={useCircleProgress}
                uri={item.photo}
                displaySelectionButtons={displaySelectionButtons}
                selected={item.selected}
                onSelection={(isSelected) => {
                  onMediaSelection(mediaList.indexOf(item), isSelected);
                }}
              />
              </View>
            </TouchableWithoutFeedback>
            </View>
          );
        } else if(item.type === 'video') {
          return(
            <View key={'row_' + mediaList.indexOf(item)} style={styles.flex}>
              <TouchableWithoutFeedback
                onPress={this._toggleControls}
                onLongPress={this._onPhotoLongPress}
                delayLongPress={this.props.delayLongPress}>
                <View>
                <VideoPlayer
                  ref={ref => this.photoRefs[mediaList.indexOf(item)] = ref}
                  useCircleProgress={useCircleProgress}
                  uri={item.photo}
                  endHandler={this._onVideoEnd}
                  displaySelectionButtons={displaySelectionButtons}
                  selected={item.selected}
                  onSelection={(isSelected) => {
                    onMediaSelection(mediaList.indexOf(item), isSelected);
                  }}
                />
                </View>
              </TouchableWithoutFeedback>
            </View>
          );
        }
    });
    this.setState({swiperList: builtList});
  }

  _toggleComingSoon = () => {
    this.setState({displayComingSoon: !this.state.});
  }

  _renderComingSoon = () => {
    const { comingSoonURI } = this.props;
    const { displayComingSoon } = this.state;

    if(displayComingSoon) {
      return(
        <TouchableWithoutFeedback onPress={this._toggleComingSoon}>
          <View>
            <Image
              source={require(comingSoonURI)}
              width={Dimensions.get('window').width}
              height={Dimensions.get('window').height}
            />
          </View>
        </TouchableWithoutFeedback>
      );
    }
  }

  _onIndexChanged = (index) => {
    this._updatePageIndex(index);
  }

  _renderScrollableContent() {
    const { dataSource, mediaList } = this.props;

    if(Platform.OS === 'ios') {
      return (
      <View style={styles.flex}>
      <Swiper
         style={styles.wrapper}
         showsPagination={false}
         ref={swiperView => this.swiperView = swiperView}
         onMomentumScrollEnd = {(e, state, context) => console.log('index:', state.index)}
         loop = {false}
         index={this.state.currentIndex}
         loadMinimal
         onIndexChanged={this._onIndexChanged}>
        {this.state.swiperList}
        </Swiper>
        </View>
      );
    } else if (Platform.OS === 'android') {
      return (
        <Swiper
          ref={swiperView => this.swiperView = swiperView}
          key={this.state.swiperList.length}
          showsPagination={false}
          style={styles.flex}
          loop={false}
          index={this.state.currentIndex}
          loadMinimal
          loadMinimalSize={1}
          onIndexChanged={this._onIndexChanged}
          >
          {this.state.swiperList}
       </Swiper>
      ); //
    }

    return (
      <ListView
        ref={scrollView => this.scrollView = scrollView}
        dataSource={dataSource}
        renderRow={this._renderRow}
        onScroll={this._onScroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled
        scrollEventThrottle={16}
      />
    );
  }

  _renderPlayButton() {
    const { controlsDisplayed, displayPlayButton, videoIsPlaying } = this.state;

    if(displayPlayButton && controlsDisplayed) {
      if(videoIsPlaying) {
        return(
          <View style={styles.transparentContainer} pointerEvents="box-none">
          <TouchableWithoutFeedback style={[styles.button, {flex: 0}]} onPress={this._onPlayButtonTapped}>
            <FontAwesome name="pause-circle" size={75} color="white"/>
          </TouchableWithoutFeedback>
          </View>
        );
      } else if(!videoIsPlaying) {
        return(
          <View style={styles.transparentContainer} pointerEvents="box-none">
          <TouchableWithoutFeedback style={[styles.button, {flex: 0}]} onPress={this._onPlayButtonTapped}>
            <FontAwesome name="play-circle" size={75} color="white"/>
          </TouchableWithoutFeedback>
          </View>
        );
      }
    } else {
    }
    return null;
  }

  render() {
    const {
      displayNavArrows,
      alwaysDisplayStatusBar,
      displayActionButton,
      displayDeleteButton,
      onGridButtonTap,
      enableGrid,
    } = this.props;
    const { controlsDisplayed, currentMedia, displayPlayButton, videoIsPlaying } = this.state;
    const BottomBarComponent = this.props.bottomBarComponent || BottomBar;

      return (
      <View style={styles.flex}>
        <StatusBar animated hidden />
        {this._renderScrollableContent()}
        {this._renderPlayButton()}
        <BottomBarComponent
          displayed={controlsDisplayed}
          height={Constants.TOOLBAR_HEIGHT}
          displayNavArrows={displayNavArrows}
          displayGridButton={enableGrid}
          //displayActionButton={displayActionButton}
          displayDeleteButton={true}
          displayPlayButton={displayPlayButton}
          videoIsPlaying={videoIsPlaying}
          media={currentMedia}
          onPrev={this._onPreviousButtonTapped}
          onNext={this._onNextButtonTapped}
          onGrid={onGridButtonTap}
          on3D={this._on3DButtonTapped}
          onAction={this._onActionButtonTapped}
          onDelete={this._onDeleteButtonTapped}
          onPlay={this._onPlayButtonTapped}
        />
      </View>
      );
    }

}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  wrapper: {
  },
  transparentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  button: {
    flex: 0,
  }
});
