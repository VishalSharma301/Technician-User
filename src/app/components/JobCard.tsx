import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons as Icon, Ionicons } from "@expo/vector-icons";
import { Job } from "../../constants/jobType";

interface Props {
  job: Job;
  onPress?: () => void;
}
interface rowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title : string;
  subtitle : string | number;
}

const JobCard: React.FC<Props> = ({ job, onPress }) => {
  function JobRows({icon, subtitle, title} : rowProps) {
    return (
      <View style={styles.row}>
        <View style={{ flexDirection: "row", borderWidth : 0 }}>
          <Icon name={icon} size={14} color="#000" />
          <Text style={styles.rowText}>{title}</Text>
        </View>
        <Text style={styles.rowSubText}>{subtitle}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Posted Date */}
      <View style={styles.postedBadge}>
        <Text style={styles.postedText}>
          Posted {new Date(job.postedAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{job.title}</Text>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {job.subcategories.slice(0, 4).map((tag, idx) => (
          <View key={idx} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Job Info Grid */}
      <View style={styles.infoGrid}>
        {/* Zip Code */}

          <JobRows icon="location-outline" title="Zip Code" subtitle={job.zipcode} />

  <JobRows icon="briefcase-outline" title="Job Type" subtitle={job.jobType} />

  <JobRows
    icon="cash-outline"
    title="Salary"
    subtitle={`₹${job.salaryRange.min} – ₹${job.salaryRange.max} /Monthly`}
  />

  <JobRows
    icon="people-outline"
    title="Positions"
    subtitle={job.positions}
  />

  <JobRows
    icon="person-add-outline"
    title="Applicants"
    subtitle={job.stats.totalApplications}
  />

  <JobRows
    icon="business-outline"
    title="City"
    subtitle={job.specificLocation || "N/A"}
  />

        
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.applyButton} onPress={onPress}>
        <Text style={styles.applyText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
};

export default JobCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingLeft: 19,
    paddingRight : 6,
    paddingTop: 6,
    marginVertical: 10,
    // elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    backgroundColor: "#FFFFFF1A",
    borderWidth: 1,
    borderColor: "#fff",
    // height : 314
  },
  postedBadge: {
    alignSelf: "flex-end",
    backgroundColor: "#D7D7D7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    // marginBottom: 8,
  },
  postedText: {
    fontSize: 8,
    color: "#000",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 9,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  tag: {
    backgroundColor: "#027CC71F",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    // marginBottom: 8,
  },
  tagText: {
    color: "#027CC7",
    fontSize: 12,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 13,
    // borderWidth: 1,
    gap : 10
  },
  row: {
    flexDirection: "column",
    // alignItems: "center",
    justifyContent : 'center',
    width: "48%",
    // marginBottom: 9,
    // borderWidth: 1,
    // height : 40
  },
  rowText: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight : '400',
    color: "#000",
    // borderWidth : 1,
    marginBottom : 3
  },
  rowSubText: {
    // marginLeft: 6,
    fontSize: 12,
    fontWeight : '400',
    color: "#00000080",
    // borderWidth : 1
  },
  applyButton: {
    backgroundColor: "#027CC7",
    borderRadius: 24,
    alignItems: "center",
    justifyContent : 'center',
    width : 84,
    height : 28,
    marginBottom : 21
  },
  applyText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "400",
    lineHeight : 16,
    // borderWidth : 1
  },
});
