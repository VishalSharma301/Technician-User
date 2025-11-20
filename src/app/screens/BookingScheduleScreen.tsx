// // src/app/screens/BookingScheduleScreen.tsx

// import React, { useState, useContext } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { Calendar } from "react-native-calendars";
// import { BookingContext } from "../../store/BookingContext";
// import { CartContext } from "../../store/CartContext";
// import { getAvailableTimeSlots } from "../../util/bookingApi";
// // import BookNowButton from "../../ui/BookNowButton";

// export default function BookingScheduleScreen() {
//   const navigation = useNavigation();
//   const { bookCurrentCart, isBooking } = useContext(BookingContext);
//   const { totalPrice, totalItems } = useContext(CartContext);

//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
//   const [notes, setNotes] = useState("");

//   const timeSlots = getAvailableTimeSlots();
//   const today = new Date().toISOString().split('T')[0];
//   const maxDate = new Date();
//   maxDate.setDate(maxDate.getDate() + 30); // 30 days from now

//   const handleBooking = async () => {
//     if (!selectedDate) {
//       Alert.alert("Date Required", "Please select a date for your service");
//       return;
//     }

//     if (!selectedTimeSlot) {
//       Alert.alert("Time Required", "Please select a time slot");
//       return;
//     }

//     const scheduledDate = new Date(`${selectedDate}T10:00:00Z`);
    
//     const result = await bookCurrentCart(
//       scheduledDate,
//       selectedTimeSlot,
//       notes || undefined,
//       "cash"
//     );

//     if (result && result.success) {
//       navigation.navigate("BookingScreen");
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Schedule Your Service</Text>
//         <Text style={styles.headerSubtitle}>
//           {totalItems} service(s) • Total: ₹{totalPrice}
//         </Text>
//       </View>

//       {/* Date Selection */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Select Date</Text>
//         <Calendar
//           minDate={today}
//           maxDate={maxDate.toISOString().split('T')[0]}
//           onDayPress={(day) => setSelectedDate(day.dateString)}
//           markedDates={{
//             [selectedDate]: {
//               selected: true,
//               selectedColor: '#153B93',
//             },
//           }}
//           theme={{
//             selectedDayBackgroundColor: '#153B93',
//             todayTextColor: '#153B93',
//             arrowColor: '#153B93',
//           }}
//         />
//       </View>

//       {/* Time Slot Selection */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Select Time Slot</Text>
//         <View style={styles.timeSlotsContainer}>
//           {timeSlots.map((slot) => (
//             <TouchableOpacity
//               key={slot}
//               style={[
//                 styles.timeSlot,
//                 selectedTimeSlot === slot && styles.selectedTimeSlot,
//               ]}
//               onPress={() => setSelectedTimeSlot(slot)}
//             >
//               <Text
//                 style={[
//                   styles.timeSlotText,
//                   selectedTimeSlot === slot && styles.selectedTimeSlotText,
//                 ]}
//               >
//                 {slot}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Summary */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Booking Summary</Text>
//         <View style={styles.summaryCard}>
//           {selectedDate && (
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Date:</Text>
//               <Text style={styles.summaryValue}>
//                 {new Date(selectedDate).toLocaleDateString('en-IN', {
//                   weekday: 'long',
//                   year: 'numeric',
//                   month: 'long',
//                   day: 'numeric',
//                 })}
//               </Text>
//             </View>
//           )}
//           {selectedTimeSlot && (
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Time:</Text>
//               <Text style={styles.summaryValue}>{selectedTimeSlot}</Text>
//             </View>
//           )}
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Services:</Text>
//             <Text style={styles.summaryValue}>{totalItems} item(s)</Text>
//           </View>
//           <View style={[styles.summaryRow, styles.totalRow]}>
//             <Text style={styles.totalLabel}>Total Amount:</Text>
//             <Text style={styles.totalValue}>₹{totalPrice}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Book Button */}
//       <View style={styles.bookingSection}>
//         <BookNowButton
//           text={isBooking ? "Booking..." : `Book Now - ₹${totalPrice}`}
//           onPress={handleBooking}
//           disabled={isBooking || !selectedDate || !selectedTimeSlot}
//           style={styles.bookButton}
//         />
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     backgroundColor: '#fff',
//     padding: 20,
//     marginBottom: 16,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#666',
//   },
//   section: {
//     backgroundColor: '#fff',
//     marginHorizontal: 16,
//     marginBottom: 16,
//     borderRadius: 12,
//     padding: 20,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 16,
//   },
//   timeSlotsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   timeSlot: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     minWidth: '45%',
//     alignItems: 'center',
//   },
//   selectedTimeSlot: {
//     backgroundColor: '#153B93',
//     borderColor: '#153B93',
//   },
//   timeSlotText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   selectedTimeSlotText: {
//     color: '#fff',
//     fontWeight: '500',
//   },
//   summaryCard: {
//     backgroundColor: '#f8f9fa',
//     borderRadius: 8,
//     padding: 16,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: '#666',
//   },
//   summaryValue: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//   },
//   totalRow: {
//     borderTopWidth: 1,
//     borderTopColor: '#ddd',
//     paddingTop: 8,
//     marginTop: 8,
//   },
//   totalLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   totalValue: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#153B93',
//   },
//   bookingSection: {
//     padding: 16,
//   },
//   bookButton: {
//     width: '100%',
//   },
// });
