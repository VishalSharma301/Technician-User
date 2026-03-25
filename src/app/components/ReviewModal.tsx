import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ViewStyle,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { scale, verticalScale, moderateScale } from "../../utils/scaling";
import CustomView from "../components/CustomView";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { BASE } from "../../utils/BASE_URL";

type CCViewProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

type ReviewModalProps = {
  visible: boolean;
  onClose: () => void;
  serviceRequestId: string;
};

function CCView({ children, style }: CCViewProps) {
  return (
    <CustomView
      radius={scale(8)}
      shadowStyle={{
        marginBottom: verticalScale(14),
      }}
    >
      {children}
    </CustomView>
  );
}

const ReviewModal = ({
  visible,
  onClose,
  serviceRequestId,
}: ReviewModalProps) => {
  const [selectedPrivate, setSelectedPrivate] = useState<number | null>(null);
  const { token } = useAuth();
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({
    serviceQuality: 0,
    professionalism: 0,
    punctuality: 0,
    communication: 0,
    problemSolving: 0,
  });

  const ratingValues = Object.values(ratings);

  const publicRating =
    ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length;

  const renderRatingItem = (label: string, keyName: keyof typeof ratings) => {
    const currentRating = ratings[keyName];

    return (
      <View style={styles.ratingItem}>
        <Text style={styles.ratingLabel}>{label}</Text>

        <View style={styles.row}>
          {Array.from({ length: 5 }).map((_, i) => {
            const starValue = i + 1;
            const isSelected = starValue <= currentRating;

            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() =>
                  setRatings((prev) => ({
                    ...prev,
                    [keyName]: starValue,
                  }))
                }
              >
                <Icon
                  name={isSelected ? "star" : "star-outline"}
                  size={moderateScale(18)}
                  color="#FFC107"
                  style={{ marginRight: scale(4) }}
                />
              </TouchableOpacity>
            );
          })}

          <Text style={styles.ratingValue}>
            {currentRating ? currentRating.toFixed(1) : "0.0"}
          </Text>
        </View>
      </View>
    );
  };

  const hideReview = async () => {
    try {
      // 🔹 Basic validation
      if (!serviceRequestId) {
        throw new Error("Service request ID is missing");
      }

      if (!token) {
        throw new Error("User authentication token missing");
      }

      const response = await axios.patch(
        `${BASE}/api/users/service-request/${serviceRequestId}/hide-review`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000, // 10 sec safety
        },
      );

      // 🔹 Validate backend success
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to hide review");
      }

      return true; // success
    } catch (error: any) {
      // 🔹 Axios error handling
      if (axios.isAxiosError(error)) {
        console.error(
          "Hide Review API Error:",
          error.response?.data || error.message,
        );

        alert(
          error.response?.data?.message || "Network error while hiding review",
        );
      } else {
        console.error("Hide Review Error:", error.message);
        alert(error.message);
      }

      return false; // failed
    }
  };
  const handleDismiss = async () => {
    try {
      await hideReview();
    } catch (e) {
      console.error(e);
    }
    onClose();
  };

  const handleSubmitReview = async () => {
    try {
      setLoading(true);

      // Validate ratings
      const hasEmptyRating = Object.values(ratings).some(
        (rating) => rating === 0,
      );

      console.log(ratings);

      if (hasEmptyRating) {
        alert("Please give all ratings before submitting");
        return;
      }

      const response = await axios.post(
        `${BASE}/api/users/reviews/${serviceRequestId}`,
        {
          _id: serviceRequestId,
          ratings,
          feedback: review,
          images: [],
          averageRating: publicRating.toFixed(2),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      await hideReview();
      alert("Review submitted successfully ✅");

      console.log(response.data);
    } catch (error: any) {
      console.log(error.response?.data || error.message);
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* HEADER */}
          <View style={styles.header}>
            {/* <TouchableOpacity style={styles.row}>
            <Icon name="chevron-left" size={moderateScale(22)} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity> */}

            <Text style={styles.headerTitle}>Job Complete</Text>

            {/* <TouchableOpacity>
            <Icon name="cog-outline" size={moderateScale(22)} />
          </TouchableOpacity> */}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: verticalScale(200) }}
          >
            {/* PRIVATE RATING */}
            <CCView>
              <View style={{ padding: scale(16) }}>
                <CCView>
                  <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                      Private Rating (Recommended)
                    </Text>
                    <Text
                      style={[
                        styles.subText,
                        {
                          borderBottomWidth: 1,
                          borderColor: "#E0E0E0",
                          paddingBottom: verticalScale(6),
                        },
                      ]}
                    >
                      Customer and Technician See this rating
                    </Text>

                    <View style={styles.grid}>
                      {Array.from({ length: 10 }).map((_, i) => {
                        const value = i + 1;
                        const isSelected = selectedPrivate === value;
                        return (
                          <TouchableOpacity
                            key={value}
                            onPress={() => setSelectedPrivate(value)}
                            style={[
                              styles.gridBox,
                              isSelected && styles.gridBoxSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.gridText,
                                isSelected && styles.gridTextSelected,
                              ]}
                            >
                              {value.toString().padStart(2, "0")}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </CCView>
                {/* PUBLIC RATING */}
                <CCView>
                  <View style={styles.card}>
                    <Text
                      style={[
                        styles.sectionTitle,
                        {
                          borderBottomWidth: 1,
                          borderColor: "#E0E0E0",
                          paddingBottom: verticalScale(6),
                        },
                      ]}
                    >
                      Public Rating
                    </Text>

                    <View style={styles.row}>
                      <Text style={styles.publicScore}>
                        {publicRating > 0 ? publicRating.toFixed(1) : "0.0"}
                      </Text>

                      <View style={styles.starRow}>
                        {Array.from({ length: 5 }).map((_, i) => {
                          const starValue = i + 1;
                          const isSelected =
                            starValue <= Math.round(publicRating);

                          return (
                            <Icon
                              key={i}
                              name={isSelected ? "star" : "star-outline"}
                              size={moderateScale(20)}
                              color="#FFC107"
                              style={{ marginRight: scale(4) }}
                            />
                          );
                        })}
                      </View>
                    </View>

                    {renderRatingItem("Service Quality", "serviceQuality")}
                    {renderRatingItem("Professionalism", "professionalism")}
                    {renderRatingItem("Punctuality", "punctuality")}
                    {renderRatingItem("Communication", "communication")}
                    {renderRatingItem("Problem Solving", "problemSolving")}
                  </View>
                </CCView>

                {/* REVIEW */}
                <CCView>
                  <View style={styles.card}>
                    <Text
                      style={[
                        styles.sectionTitle,
                        {
                          borderBottomWidth: 1,
                          borderColor: "#E0E0E0",
                          paddingBottom: verticalScale(6),
                          marginBottom: verticalScale(13),
                        },
                      ]}
                    >
                      Review
                    </Text>

                    <CCView>
                      <TextInput
                        placeholder="Excellent knowledge And Great Experience"
                        placeholderTextColor="#999"
                        multiline
                        value={review}
                        onChangeText={setReview}
                        style={styles.textArea}
                      />
                    </CCView>
                  </View>
                </CCView>

                {/* BUTTONS */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={handleDismiss}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ width: "49%" }}
                    onPress={handleSubmitReview}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={["#027CC7", "#004DBD"]}
                      // start={{ x: 0, y: 0 }}
                      // end={{ x: 1, y: 1 }}
                      style={styles.submitBtn}
                    >
                      <Text style={styles.submitText}>Submit</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </CCView>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ReviewModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#F0EFF8",
    // maxHeight: "90%",
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(50),
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: verticalScale(10),
  },
  backText: {
    marginLeft: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
  },

  card: {
    // backgroundColor: "#FFF",
    padding: scale(14),
    // borderRadius: scale(12),
    // marginBottom: verticalScale(14),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  subText: {
    fontSize: moderateScale(12),
    color: "#666",
    marginBottom: verticalScale(10),
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridBox: {
    width: "18%",
    paddingVertical: verticalScale(12),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  gridBoxSelected: {
    backgroundColor: "#2764E7",
    borderColor: "#2764E7",
  },
  gridText: {
    fontSize: moderateScale(14),
  },
  gridTextSelected: {
    color: "#FFF",
    fontWeight: "600",
  },

  publicScore: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    marginRight: scale(8),
  },
  starRow: {
    flexDirection: "row",
  },

  ratingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(10),
  },
  ratingLabel: {
    fontSize: moderateScale(14),
  },
  ratingValue: {
    marginLeft: scale(6),
    fontSize: moderateScale(13),
    color: "#444",
  },

  textArea: {
    height: verticalScale(120),
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: scale(10),
    padding: scale(10),
    // marginTop: verticalScale(10),
    textAlignVertical: "top",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(20),
  },
  cancelBtn: {
    width: "49%",
    borderWidth: 1,
    borderColor: "#027CC7",
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
    height: verticalScale(31),
  },
  cancelText: {
    color: "#0164C2",
    fontWeight: "600",
  },
  submitBtn: {
    // width: "49%",
    // paddingVertical: verticalScale(12),
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
    height: verticalScale(31),
  },
  submitText: {
    color: "#FFF",
    fontWeight: "600",
  },

  bottomTab: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: verticalScale(10),
    borderTopWidth: 1,
    borderColor: "#EEE",
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
  },
  tabLabel: {
    fontSize: moderateScale(12),
    marginTop: verticalScale(4),
    color: "#999",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
