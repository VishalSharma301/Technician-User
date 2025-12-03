import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import JobCard from "../components/JobCard";
import { Job } from "../../constants/jobType";
import { getJobsByZipcode } from "../../utils/jobsApi";
import ScreenWrapper from "../components/ScreenWrapper";
import JobForm from "../components/JobForm";

const JobsScreen = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const zipcode = "140802";

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await getJobsByZipcode(zipcode);
      setJobs(res.data || []);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10 }}>Loading jobs...</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <JobForm
        visible={visible}
        jobId={selectedJobId}
        onClose={() => setVisible(false)}
        onSubmit={() => setVisible(false)}
      />

      <View style={styles.container}>
        {jobs.length === 0 ? (
          <View style={styles.center}>
            <Text>No jobs found</Text>
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <JobCard
                job={item}
                onPress={() => {
                  setSelectedJobId(item.id);
                  setVisible(true);
                }}
              />
            )}
            contentContainerStyle={{ padding: 16 }}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default JobsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
