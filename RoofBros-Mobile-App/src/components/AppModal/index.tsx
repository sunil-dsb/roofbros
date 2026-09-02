import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import AppText from '../AppText';
import { colors } from '../../themes/colors';
import fontSizes from '../../themes/fontSizes';

export interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  type?: 'center' | 'bottom';
  children?: React.ReactNode;
}

const AppModal = ({
  visible,
  onClose,
  title,
  description,
  type = 'center',
  children,
}: AppModalProps) => {
  const isBottom = type === 'bottom';
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible && isBottom) {
      slideAnim.setValue(300);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, isBottom, slideAnim]);

  const handleClose = () => {
    if (isBottom) {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={[styles.overlay, isBottom && styles.overlayBottom]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.content,
                isBottom && styles.contentBottom,
                isBottom && { transform: [{ translateY: slideAnim }] },
              ]}
            >
              {title && (
                <AppText variant="title" style={styles.title}>
                  {title}
                </AppText>
              )}
              {description && (
                <AppText style={styles.description}>{description}</AppText>
              )}
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AppModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: colors.ground,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    // Add iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // Add Android elevation
    elevation: 8,
  },
  overlayBottom: {
    justifyContent: 'flex-end',
    padding: 0,
  },
  contentBottom: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 24,
    paddingBottom: 24,
    width: '100%',
    maxWidth: '100%',
  },
  title: {
    fontSize: fontSizes.f22,
    color: colors.ink,
    marginBottom: 12,
  },
  description: {
    fontSize: fontSizes.f16,
    color: colors.ink, // Using ink instead of muted for higher contrast body text in modal
    lineHeight: 24,
    marginBottom: 24,
  },
});
