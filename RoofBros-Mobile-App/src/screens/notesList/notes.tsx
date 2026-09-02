import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentJob } from '../../redux/slices/globalSlice';
import { goBack } from '../../navigations/navigationServices';
import { useAddJobNoteMutation } from '../../redux/services/homeApi';
import { managerApiCall } from '../../helper/manageApiCallFun';
import AppText from '../../components/AppText';
import IconButton from '../../components/IconButton';
import CustomButton from '../../components/CustomButton';
import FixedFooter from '../../components/FixedFooter';
import StackedInput from '../../components/StackedInput';
import BackIcon from '../../assets/icons/backIcon';
import DocumentIcon from '../../assets/icons/documentIcon';
import { colors } from '../../themes/colors';
import { fontFamily } from '../../assets/fontFamily';
import fontSizes from '../../themes/fontSizes';
import { spacing, width } from '../../themes/spacing';
import { CustomKeyboardScrollView } from '../../components';
import { FlashList } from '@shopify/flash-list';

const Notes = () => {
  const dispatch = useDispatch();
  const apiJob = useSelector((state: any) => state.global.currentJob);

  const [addJobNote] = useAddJobNoteMutation();

  // Ensure we fall back gracefully to an empty array
  const rawNotes = apiJob?.additionalNotes || [];
  const notes: { text: string; createdAt?: string }[] = rawNotes
    .map((n: any) => {
      if (typeof n === 'string') {
        return { text: n, createdAt: new Date().toISOString() };
      }
      return n;
    })
    .filter((n: any) => n?.text?.trim().length > 0);

  const [noteText, setNoteText] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <CustomKeyboardScrollView contentContainerStyle={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            onPress={() => goBack()}
            accessibilityLabel="Go back"
            icon={<BackIcon color={colors.ink} size={24} />}
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <AppText style={styles.title}>Notes</AppText>
          <AppText style={styles.subtitle}>
            {apiJob?.address || 'Unknown Address'}
          </AppText>
        </View>

        {/* Note Cards */}
        <View style={styles.notesContainer}>
          <FlashList
            data={notes}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
              <View style={styles.noteCard}>
                <AppText style={styles.noteText}>{item.text}</AppText>
                <AppText style={styles.noteWhen}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'Recorded recently'}
                </AppText>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <DocumentIcon color={colors.muted} size={32} />
                <AppText style={styles.emptyTitle}>No notes yet</AppText>
                <AppText style={styles.emptySubtitle}>
                  Gate codes, access, the dog anything the crew should know
                  before they turn up.
                </AppText>
              </View>
            }
          />
        </View>

        <StackedInput
          style={styles.input}
          placeholder="Add a note..."
          placeholderTextColor={colors.muted}
          value={noteText}
          onChangeText={setNoteText}
          multiline
        />
        <CustomButton
          title="Save note"
          onPress={() => {
            if (apiJob?.id && noteText.trim().length > 0) {
              const payload = {
                id: apiJob.id,
                body: {
                  notes: [noteText.trim()],
                },
              };
              managerApiCall(
                addJobNote,
                payload,
                (res: any) => {
                  console.log('Note added successfully', res);
                  setNoteText('');
                  // If API returns the updated job, merge it with the existing job.
                  if (res?.data?.id || res?.id) {
                    dispatch(
                      setCurrentJob({ ...apiJob, ...(res?.data || res) }),
                    );
                  } else {
                    dispatch(
                      setCurrentJob({
                        ...apiJob,
                        additionalNotes: [
                          {
                            text: noteText.trim(),
                            createdAt: new Date().toISOString(),
                          },
                          ...(apiJob.additionalNotes || []),
                        ],
                      }),
                    );
                  }
                },
                err => console.log('Add note failed', err),
              );
            }
          }}
          style={{ marginHorizontal: 20, marginBottom: width * 0.05 }}
          disabled={noteText.trim().length === 0}
        />
      </CustomKeyboardScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  inner: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
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
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    color: colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.muted,
  },
  notesContainer: {
    paddingHorizontal: 20,
    flex: 1,
    minHeight: 200,
  },
  noteCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  noteText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: 8,
  },
  noteWhen: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.f13,
    color: colors.muted,
  },
  input: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.f15,
    color: colors.ink,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: width * 0.4,
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

export default Notes;
