import { StyleSheet, Text, TextInput } from 'react-native';

export const globalStyles = StyleSheet.create({
  text: {
    fontFamily: 'Inter_400Regular',
  },
  textMedium: {
    fontFamily: 'Inter_500Medium',
  },
  textSemiBold: {
    fontFamily: 'Inter_600SemiBold',
  },
  textBold: {
    fontFamily: 'Inter_700Bold',
  },
  textExtraBold: {
    fontFamily: 'Inter_800ExtraBold',
  },
});

const defaultTextProps = Text.defaultProps || {};
Text.defaultProps = {
  ...defaultTextProps,
  style: [globalStyles.text, defaultTextProps.style],
};

const defaultTextInputProps = TextInput.defaultProps || {};
TextInput.defaultProps = {
  ...defaultTextInputProps,
  style: [globalStyles.text, defaultTextInputProps.style],
};
