import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import axios from "axios";
import ScreenWrapper from "../components/ScreenWrapper";
import { moderateScale, scale, verticalScale } from "../../utils/scaling";
import Header from "../components/Header";
import { getJobsByZipcode } from "../../utils/jobsApi";

const ratingCategories = [
  {
    key: "serviceQuality",
    label: "Service Quality",
    sub: "How was the quality of the service?",
  },
  {
    key: "professionalism",
    label: "Professionalism",
    sub: "Was the provider professional?",
  },
  {
    key: "punctuality",
    label: "Punctuality",
    sub: "Was the provider on time?",
  },
  {
    key: "communication",
    label: "Communication",
    sub: "Was communication clear?",
  },
  {
    key: "problemSolving",
    label: "Problem Solving",
    sub: "Was the provider able to solve problems?",
  },
];

export default function SubmitReviewScreen({ route, navigation }: any) {
  const serviceRequestId = 123;

  const [ratings, setRatings] = useState<any>({
    serviceQuality: 0,
    professionalism: 0,
    punctuality: 0,
    communication: 0,
    problemSolving: 0,
  });

  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
      async function yo() {
        const response = await getJobsByZipcode('140802')
        console.log("jobs :" , response);
        
      }

      yo()

  }, []);

  const handleRatingSelect = (category: string, value: number) => {
    setRatings({ ...ratings, [category]: value });
  };

  const validate = () => {
    const values = Object.values(ratings);
    if (values.includes(0)) {
      Alert.alert("Missing Ratings", "Please rate all categories (1–5 stars).");
      return false;
    }
    if (feedback.length > 1000) {
      Alert.alert(
        "Feedback Too Long",
        "Feedback cannot exceed 1000 characters."
      );
      return false;
    }
    return true;
  };

  const submitReview = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `https://your-api.com/api/user/reviews/${serviceRequestId}`,
        {
          ratings,
          feedback,
          images: [],
        },
        {
          headers: {
            Authorization: `Bearer YOUR_USER_TOKEN`,
            "Content-Type": "application/json",
          },
        }
      );

      setLoading(false);
      Alert.alert("Success", "Review submitted successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setLoading(false);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to submit review"
      );
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: verticalScale(30), opacity: 0 }}
      >
        <Header />

        <View
          style={{
            marginTop: verticalScale(12),
            borderWidth: scale(1),
            paddingVertical: verticalScale(19),
            borderRadius: scale(8),
            borderColor: "#ffffff",
          }}
        >
          <Text style={styles.heading}>
            How would you rate the service you received?
          </Text>

          {ratingCategories.map((item) => (
            <View key={item.key} style={styles.card}>
              <Text style={styles.title}>{item.label}</Text>
              <Text style={styles.subtitle}>{item.sub}</Text>

              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => handleRatingSelect(item.key, num)}
                  >
                    <Icon
                      name={ratings[item.key] >= num ? "star" : "star-outline"}
                      size={moderateScale(18)}
                      color="#FFD700"
                      style={{ marginRight: scale(6) }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Feedback */}
          <View style={{ paddingHorizontal: scale(13) }}>
            <Text style={styles.feedbackLabel}>Feedback</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Write your feedback..."
              value={feedback}
              onChangeText={setFeedback}
              multiline
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={submitReview}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff10",
    padding: scale(9),
    paddingBottom: verticalScale(150),
  },

  heading: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#000",
    paddingHorizontal: scale(13),
    borderBottomWidth: scale(1),
    borderBottomColor: "#0000001A",
    paddingBottom: verticalScale(10),
  },

  card: {
    height: verticalScale(89),
    backgroundColor: "#FFFFFF1A",
    paddingVertical: verticalScale(11),
    paddingHorizontal: scale(13),
    borderBottomWidth: scale(1),
    borderColor: "#0000001A",
  },

  title: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#153B93",
  },

  subtitle: {
    fontSize: moderateScale(12),
    fontWeight: "400",
    color: "#1B281B80",
    marginTop: verticalScale(3),
  },

  starRow: {
    flexDirection: "row",
    marginTop: verticalScale(10),
  },

  feedbackLabel: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    marginTop: verticalScale(15),
    marginBottom: verticalScale(8),
    color: "#153B93",
  },

  feedbackInput: {
    minHeight: verticalScale(90),
    textAlignVertical: "top",
    borderRadius: scale(12),
    padding: moderateScale(12),
    fontSize: moderateScale(13),
    borderWidth: scale(1),
    borderColor: "#C4C4C4",
  },

  submitBtn: {
    backgroundColor: "#153B93",
    paddingVertical: verticalScale(14),
    borderRadius: scale(12),
    alignItems: "center",
    marginTop: verticalScale(25),
    marginBottom: verticalScale(160),
  },

  submitText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "700",
  },
});
