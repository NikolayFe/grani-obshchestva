import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { resolveTheoryTopic } from '../data/theoryData';

export default function TheoryScreen({ route, navigation }: any) {
  const category = route?.params?.category;
  const topic = resolveTheoryTopic(category);
  const accentColor = category?.color || colors.primary.main;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={colors.text.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerCaption}>Теория по теме</Text>
            <Text style={styles.headerTitle}>{topic.title}</Text>
          </View>
        </View>

        <View style={[styles.introCard, { borderLeftColor: accentColor }]}> 
          <Text style={styles.introText}>{topic.intro}</Text>
        </View>

        <View style={styles.sectionList}>
          {topic.sections.map((section) => (
            <View key={section.title} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.points.map((point, index) => (
                <View key={`${section.title}-${index}`} style={styles.pointRow}>
                  <View style={[styles.dot, { backgroundColor: accentColor }]} />
                  <Text style={styles.pointText}>{point}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.checkCard}>
          <View style={styles.checkHeaderRow}>
            <Ionicons name="checkmark-done-circle" size={20} color="#15803D" />
            <Text style={styles.checkTitle}>Что выучить к итоговому тестированию</Text>
          </View>
          {topic.finalChecklist.map((item, index) => (
            <View key={`check-${index}`} style={styles.pointRow}>
              <Text style={styles.checkNumber}>{index + 1}.</Text>
              <Text style={styles.pointText}>{item}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={[styles.primaryButton, { backgroundColor: accentColor }]}
          onPress={() => navigation.navigate('CategoryTests', { category })}
        >
          <Text style={styles.primaryButtonText}>Перейти к тестам по теме</Text>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCaption: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  headerTitle: {
    marginTop: 2,
    fontSize: 24,
    color: colors.text.primary,
    fontWeight: '800',
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  introText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.text.secondary,
  },
  sectionList: {
    gap: 10,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  pointRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 6,
  },
  pointText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text.secondary,
  },
  checkCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 12,
    gap: 8,
  },
  checkHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
    flex: 1,
  },
  checkNumber: {
    width: 18,
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
