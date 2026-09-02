import { StyleSheet } from 'react-native';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.ground, // --surface (#FFFFFF)
    borderTopWidth: 1,
    borderTopColor: colors.ink, // --line-ink (#2D2012)
    height: 66, // 66px from CSS spec
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: fontSizes.f12,
    fontFamily: fontFamily.medium,
    textAlign: 'center',
  },
});

export default styles;
