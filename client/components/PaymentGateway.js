import React from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const PaymentGateway = ({ 
  amount, 
  email, 
  name, 
  onSuccess, 
  onCancel, 
  onError, 
  reference = `RES-${Date.now()}`,
  isVisible = false
}) => {
  if (!isVisible) return null;

  // Web platform payment implementation
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <WebView
          source={{
            uri: `https://checkout.paystack.com/pay/${amount}?email=${email}&reference=${reference}`,
          }}
          style={styles.webview}
          onNavigationStateChange={(state) => {
            if (state.url.includes('success')) {
              onSuccess?.({ data: { reference } });
            } else if (state.url.includes('cancel')) {
              onCancel?.();
            }
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            onError?.(nativeEvent);
          }}
        />
      </View>
    );
  }

  // Native platforms (iOS/Android) implementation
  try {
    const PaystackWebView = require('react-native-paystack-webview').PaystackWebView;
    
    return (
      <View style={styles.container}>
        <PaystackWebView
          paystackKey="pk_test_5f5d79a174fd70e26e71f19e4cae5821126edc2c"
          amount={amount}
          billingEmail={email}
          billingName={name}
          billingMobile="07000000000"
          ActivityIndicatorColor="green"
          SafeAreaViewContainer={{ marginTop: 25 }}
          onCancel={() => {
            onCancel?.();
            Alert.alert('Payment Cancelled', 'You can try again or choose to pay on arrival.');
          }}
          onSuccess={(response) => {
            onSuccess?.(response);
            Alert.alert('Payment Successful', 'Your reservation has been confirmed!');
          }}
          onError={(error) => {
            onError?.(error);
            Alert.alert('Payment Failed', 'Unable to process payment. Please try again or choose to pay on arrival.');
            console.error('Payment error:', error);
          }}
          autoStart={true}
          channels={['card', 'bank', 'ussd', 'qr', 'mobile_money']}
          currency="NGN"
          refNumber={reference}
        />
      </View>
    );
  } catch (error) {
    console.error('PaystackWebView load error:', error);
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  webview: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 50,
    marginBottom: 50,
    marginHorizontal: 20,
    borderRadius: 10,
  }
});

export default PaymentGateway; 