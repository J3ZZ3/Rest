import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert, TextInput, Linking, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PaystackWebView } from 'react-native-paystack-webview';
import PaymentGateway from '../components/PaymentGateway';

const RestaurantDetailScreen = () => {
  const { restaurantId, token, userId, userEmail, userName } = useLocalSearchParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state variables for reservation details
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [guests, setGuests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const paystackWebViewRef = useRef(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const response = await axios.get(`https://restaurant-server-5htc.onrender.com/api/restaurants/${restaurantId}`);
        setRestaurant(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch restaurant details');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [restaurantId]);

  const handlePayment = async () => {
    if (!guests || Number(guests) <= 0) {
      Alert.alert('Error', 'Please enter a valid number of guests');
      return;
    }

    if (paymentMethod === 'online') {
      setShowPaymentGateway(true);
    } else {
      // Handle pay on arrival
      await createReservation();
    }
  };

  const createReservation = async (paymentReference = null) => {
    try {
      const reservationData = {
        restaurantId,
        date,
        timeSlot: time.toLocaleTimeString(),
        numberOfGuests: Number(guests),
        paymentMethod,
        paymentReference,
      };

      const response = await axios.post(
        'https://restaurant-server-5htc.onrender.com/api/reservations',
        reservationData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Alert.alert(
        'Success', 
        paymentReference 
          ? 'Payment successful and reservation confirmed!' 
          : 'Reservation confirmed! Please pay at the restaurant.'
      );
      router.back();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create reservation');
    }
  };

  const calculateAmount = () => {
    const basePrice = 1000; // ₦1000 per person
    return Number(guests) * basePrice;
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{restaurant.name}</Text>
      <Text>{restaurant.cuisine}</Text>
      <Text>{restaurant.location}</Text>
      <Text>{restaurant.description}</Text>
      
      <Text style={styles.selectedText}>Selected Date: {date.toLocaleDateString()}</Text>
      <Text style={styles.selectedText}>Selected Time: {time.toLocaleTimeString()}</Text>

      <Button title="Select Date" onPress={showDatepicker} />
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <Button title="Select Time" onPress={showTimepicker} />
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Number of Guests"
        value={guests}
        onChangeText={setGuests}
        keyboardType="numeric"
      />
      
      <View style={styles.paymentOptionContainer}>
        <Text style={styles.paymentLabel}>Payment Option:</Text>
        <View style={styles.radioContainer}>
          <View style={styles.radioOption}>
            <Button
              title="Pay Online"
              onPress={() => setPaymentMethod('online')}
              color={paymentMethod === 'online' ? '#007AFF' : '#999999'}
            />
          </View>
          <View style={styles.radioOption}>
            <Button
              title="Pay On Arrival"
              onPress={() => setPaymentMethod('arrival')}
              color={paymentMethod === 'arrival' ? '#007AFF' : '#999999'}
            />
          </View>
        </View>
      </View>
      
      <PaymentGateway
        amount={calculateAmount()}
        email={userEmail}
        name={userName}
        isVisible={showPaymentGateway}
        onSuccess={(response) => {
          setShowPaymentGateway(false);
          createReservation(response.data.reference);
        }}
        onCancel={() => {
          setShowPaymentGateway(false);
        }}
        onError={(error) => {
          setShowPaymentGateway(false);
          console.error('Payment error:', error);
        }}
      />

      <View style={styles.buttonContainer}>
        <Button title="Book a Reservation" onPress={handlePayment} />
        <Button 
          title="Contact Restaurant" 
          onPress={() => {
            const contactNumber = restaurant.contact;
            if (contactNumber) {
              Linking.openURL(`tel:${contactNumber}`);
            } else {
              Alert.alert('No contact number available');
            }
          }} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  selectedText: {
    fontSize: 16,
    marginVertical: 8,
  },
  paymentOptionContainer: {
    marginBottom: 20,
  },
  paymentLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioOption: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default RestaurantDetailScreen; 