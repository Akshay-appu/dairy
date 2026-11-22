import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GREEN, INK, LIGHT_GREEN, MUTED, DANGER } from '../theme';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled React Error in ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRestart = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || String(this.state.error || 'Unknown error');
      const componentStack = this.state.errorInfo?.componentStack;

      return (
        <SafeAreaView style={styles.safe}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🌾</Text>
            </View>

            <Text style={styles.brandTitle}>BHOOMISHAKTI DIARY</Text>
            <Text style={styles.heading}>Something went wrong</Text>
            <Text style={styles.subheading}>
              The application encountered an unexpected error. Your offline farm diary data is safe
              in local storage.
            </Text>

            <View style={styles.errorBox}>
              <Text style={styles.errorBoxTitle}>Error Details:</Text>
              <Text style={styles.errorText} numberOfLines={4}>
                {errorMessage}
              </Text>
              {Boolean(componentStack) && (
                <Text style={styles.stackText} numberOfLines={6}>
                  {componentStack?.trim()}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRestart}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>🔄 Try Again</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAF7',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: GREEN,
    marginBottom: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: INK,
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 360,
  },
  errorBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2ECE4',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  errorBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  errorText: {
    fontSize: 13,
    color: DANGER,
    fontWeight: '600',
    lineHeight: 18,
  },
  stackText: {
    fontSize: 11,
    color: '#88998D',
    marginTop: 8,
    fontFamily: 'monospace',
    lineHeight: 15,
  },
  retryButton: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
