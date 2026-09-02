import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import IconButton from '../IconButton';
import BackIcon from '../../assets/icons/backIcon';
import CloseIcon from '../../assets/icons/closeIcon';
import TrashIcon from '../../assets/icons/trashIcon';
import { colors } from '../../themes/colors';
import AppModal from '../AppModal';
import CustomButton from '../CustomButton';

interface FlowHeaderProps {
  onBackPress?: () => void;
  onClosePress?: () => void;
  currentStep?: number;
  totalSteps?: number;
  style?: StyleProp<ViewStyle>;
  skipDiscardModal?: boolean;
}

const FlowHeader = ({
  onBackPress,
  onClosePress,
  currentStep,
  totalSteps,
  style,
  skipDiscardModal,
}: FlowHeaderProps) => {
  const [showModal, setShowModal] = React.useState(false);

  const handleClosePress = () => {
    if (onClosePress) {
      if (skipDiscardModal) {
        onClosePress();
      } else {
        setShowModal(true);
      }
    }
  };

  const confirmClose = () => {
    setShowModal(false);
    if (onClosePress) onClosePress();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.buttonsContainer}>
        {onBackPress ? (
          <IconButton
            onPress={onBackPress}
            icon={<BackIcon color={colors.ink} size={24} />}
            accessibilityLabel="Go back"
          />
        ) : (
          <View style={styles.placeholder} />
        )}

        {onClosePress ? (
          <View style={styles.closeButtonContainer}>
            <IconButton
              onPress={handleClosePress}
              icon={<CloseIcon color={colors.ink} size={20} />}
              accessibilityLabel="Close"
            />
          </View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {totalSteps && (
        <View style={styles.progressContainer}>
          {totalSteps !== undefined &&
            currentStep !== undefined &&
            Array.from({ length: totalSteps }).map((_, i) => {
              const isActive = i < currentStep;
              return (
                <View
                  key={i}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: isActive
                        ? colors.accent
                        : colors.lineSoft,
                    },
                  ]}
                />
              );
            })}
        </View>
      )}

      <AppModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Discard this quote?"
        description="You've entered measurements that aren't saved yet. Closing now discards them."
      >
        <View style={styles.modalActions}>
          <CustomButton
            title="Discard quote"
            variant="dangerOutline"
            iconLeft={<TrashIcon color={colors.error} size={18} />}
            onPress={confirmClose}
            style={styles.modalButton}
          />
          <CustomButton
            title="Keep editing"
            variant="primary"
            iconLeft={<BackIcon color={colors.ground} size={18} />}
            onPress={() => setShowModal(false)}
            style={styles.modalButton}
          />
        </View>
      </AppModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 15,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  closeButtonContainer: {
    borderColor: colors.ink,
    borderRadius: 22, // Assuming 44x44
  },
  modalActions: {
    flexDirection: 'column',
    gap: 12,
  },
  modalButton: {
    width: '100%',
  },
});

export default FlowHeader;
