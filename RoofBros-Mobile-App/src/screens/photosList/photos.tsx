import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentJob } from '../../redux/slices/globalSlice';
import ImagePicker from 'react-native-image-crop-picker';
import { goBack } from '../../navigations/navigationServices';
import { useAddJobPhotoMutation } from '../../redux/services/homeApi';
import {
  getImageUrl,
  checkCameraPermission,
  checkPhotoLibraryPermission,
} from '../../helper/commonFunctions';
import { managerApiCall } from '../../helper/manageApiCallFun';
import { ShowAlertMessage } from '../../helper/showAlertMessage';
import AppText from '../../components/AppText';
import IconButton from '../../components/IconButton';
import CustomButton from '../../components/CustomButton';
import FixedFooter from '../../components/FixedFooter';
import AppModal from '../../components/AppModal';
import BackIcon from '../../assets/icons/backIcon';
import CameraIcon from '../../assets/icons/cameraIcon';
import PlusIcon from '../../assets/icons/plusIcon';
import CloseIcon from '../../assets/icons/closeIcon';
import TrashIcon from '../../assets/icons/trashIcon';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';
import { spacing, width } from '../../themes/spacing';
import { appImages } from '../../themes/appImages';
import { FlashList } from '@shopify/flash-list';
import FastImage from '@d11/react-native-fast-image';
import { Spacer } from '../../components';

const Photos = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const apiJob = useSelector((state: any) => state.global.currentJob);

  const [addJobPhoto] = useAddJobPhotoMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  const allPhotos: any[] = [];
  if (Array.isArray(apiJob?.dropzonePhotos)) {
    apiJob.dropzonePhotos.forEach((photo: any) => {
      if (photo?.url || typeof photo === 'string') {
        const rawUrl = photo?.url || photo;
        // If it's a local file URI, use it directly. Otherwise use getImageUrl.
        const sourceObj =
          rawUrl.startsWith('file://') || rawUrl.startsWith('content://')
            ? { uri: rawUrl }
            : getImageUrl(rawUrl);

        allPhotos.push({
          source: sourceObj,
          createdAt: photo?.createdAt || null,
        });
      }
    });
  }

  const handleAddPhoto = (imageFile: any) => {
    if (!apiJob?.id) return;

    // imageFile should be an object like: { uri: string, type: string, name: string }
    const formData = new FormData();
    formData.append('images', imageFile);

    const payload = {
      id: apiJob.id,
      body: formData,
    };

    managerApiCall(
      addJobPhoto,
      payload,
      (res: any) => {
        setIsModalVisible(false);
        // Update global state so the photo appears immediately
        if (res?.data?.id || res?.id) {
          dispatch(setCurrentJob({ ...apiJob, ...(res?.data || res) }));
        } else {
          dispatch(
            setCurrentJob({
              ...apiJob,
              dropzonePhotos: [
                ...(apiJob.dropzonePhotos || []),
                { url: imageFile.uri, createdAt: new Date().toISOString() },
              ],
            }),
          );
        }
      },
      err => console.log('Add photo failed', err),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          onPress={() => goBack()}
          accessibilityLabel="Go back"
          icon={<BackIcon color={colors.ink} size={24} />}
        />
      </View>
      <View style={styles.titleContainer}>
        <AppText style={styles.title}>Photos</AppText>
        <AppText style={styles.subtitle}>
          {apiJob?.address || 'Unknown Address'}
        </AppText>
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={allPhotos}
          keyExtractor={(_, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.scrollContent}
          columnWrapperStyle={{
            gap: 10,
          }}
          ItemSeparatorComponent={() => <Spacer height={10} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CameraIcon color={colors.muted} size={32} />
              <AppText style={styles.emptyTitle}>No photos yet</AppText>
              <AppText style={styles.emptySubtitle}>
                Shots you take here are stamped with the time and stay with this
                job.
              </AppText>
            </View>
          }
          renderItem={({ item: photo, index }) => (
            <TouchableOpacity
              style={[styles.photoCell]}
              activeOpacity={0.85}
              onPress={() => setSelectedPhoto(photo.source)}
            >
              <FastImage
                source={photo.source}
                style={styles.photo}
                resizeMode={FastImage.resizeMode.cover}
              />
              {photo.createdAt && (
                <View style={styles.timestampContainer}>
                  <AppText style={styles.timestamp}>
                    {new Date(photo.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Footer */}
      <FixedFooter
        style={{
          paddingBottom: width * 0.05,
        }}
      >
        <CustomButton
          title="Add photo"
          onPress={() => {
            if (allPhotos.length >= 5) {
              ShowAlertMessage('You can only add up to 5 photos.', 'error');
            } else {
              setIsModalVisible(true);
            }
          }}
          iconLeft={<PlusIcon color={colors.ground} size={20} />}
        />
      </FixedFooter>

      {/* Add Photo Bottom Sheet Modal */}
      <AppModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        type="bottom"
      >
        <View
          style={[
            styles.modalContent,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <AppText style={styles.modalTitle}>Add photo</AppText>
          <View style={styles.modalButtonsContainer}>
            <CustomButton
              title="Take photo"
              variant="primary"
              iconLeft={<CameraIcon color={colors.ground} size={20} />}
              onPress={async () => {
                try {
                  const checkCamPer = await checkCameraPermission();
                  if (checkCamPer) {
                    ImagePicker.openCamera({
                      mediaType: 'photo',
                      compressImageMaxWidth: 1024,
                      compressImageMaxHeight: 1024,
                      compressImageQuality: 0.7,
                      useFrontCamera: false,
                    })
                      .then(image => {
                        setIsModalVisible(false);
                        handleAddPhoto({
                          uri: image.path,
                          type: image.mime,
                          name: image.filename || `camera_${Date.now()}.jpg`,
                        });
                      })
                      .catch(err => console.log('Camera error', err));
                  } else {
                    console.log('in else open camera handle');
                  }
                } catch (error) {
                  console.log(error, 'error in on Camera open handle');
                }
              }}
            />
            <CustomButton
              title="Choose from library"
              variant="secondary"
              onPress={async () => {
                try {
                  const checkPhotoLibPer = await checkPhotoLibraryPermission();
                  if (checkPhotoLibPer) {
                    ImagePicker.openPicker({
                      mediaType: 'photo',
                      compressImageMaxWidth: 1024,
                      compressImageMaxHeight: 1024,
                      compressImageQuality: 0.7,
                    })
                      .then(image => {
                        setIsModalVisible(false);
                        handleAddPhoto({
                          uri: image.path,
                          type: image.mime,
                          name: image.filename || `library_${Date.now()}.jpg`,
                        });
                      })
                      .catch(err => console.log('Picker error', err));
                  } else {
                    console.log('in else open gallery handle');
                  }
                } catch (error) {
                  console.log(error, 'error in on Gallery open handle');
                }
              }}
            />
          </View>
        </View>
      </AppModal>

      {/* Fullscreen Photo Viewer Modal */}
      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View
          style={[
            styles.viewerContainer,
            {
              paddingTop: insets.top + spacing.s,
              paddingBottom: Math.max(insets.bottom, spacing.s),
            },
          ]}
        >
          {/* Header Action Buttons */}
          <View style={styles.viewerHeader}>
            <TouchableOpacity
              onPress={() => setSelectedPhoto(null)}
              style={styles.viewerCircleBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <CloseIcon color={colors.ground} size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedPhoto(null)}
              style={styles.viewerCircleBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <TrashIcon color={colors.ground} size={20} />
            </TouchableOpacity>
          </View>

          {/* Fullscreen Image Preview */}
          <View style={styles.viewerImageWrapper}>
            {selectedPhoto && (
              <FastImage
                source={selectedPhoto}
                style={styles.viewerImage}
                resizeMode={FastImage.resizeMode.contain}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    paddingHorizontal: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSizes.f24,
    color: colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.muted,
  },
  dateLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f15,
    color: colors.muted,
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 12,
  },
  photoGridList: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    flexWrap: 'wrap',
  },
  photoCell: {
    flex: 1,
    aspectRatio: 1.5, // Approx wide aspect ratio for photos
    backgroundColor: colors.surface,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  timestampContainer: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  timestamp: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f11,
    color: colors.ground,
  },
  modalContent: {
    width: '100%',
  },
  modalTitle: {
    fontFamily: fontFamily.heading,
    fontSize: fontSizes.f22,
    color: colors.ink,
    marginBottom: 20,
  },
  modalButtonsContainer: {
    gap: 12,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: '#1C130D', // Dark espresso tone matching design image
  },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  viewerCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: width * 0.5,
  },
  emptyTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSizes.f16,
    color: colors.ink,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Photos;
