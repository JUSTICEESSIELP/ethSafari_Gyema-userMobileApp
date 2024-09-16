import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import { Dimensions } from 'react-native';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/proxy/87334/gyema/0.0.2/graphql',
  cache: new InMemoryCache()
});

// GraphQL query with variables, sorting, filtering, and pagination
const CARBON_SAVINGS_QUERY = gql`
  query GetCarbonSavings($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!, $where: CarbonSavingsStats_filter) {
    carbonSavingsStats(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      timestamp
      totalCarbonSavings
      count
      user {
        id
        totalCarbonSavings
      }
    }
    _meta {
      block {
        number
      }
    }
  }
`;

const CarbonSavingsDashboard = () => {
  const [chartData, setChartData] = useState([]);
  const { loading, error, data, fetchMore } = useQuery(CARBON_SAVINGS_QUERY, {
    variables: {
      first: 30,
      skip: 0,
      orderBy: "timestamp",
      orderDirection: "desc",
      where: {
        totalCarbonSavings_gt: "0"
      }
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data && data.carbonSavingsStats) {
      const formattedData = data.carbonSavingsStats.map(stat => ({
        timestamp: new Date(stat.timestamp * 1000).toLocaleDateString(),
        value: parseFloat(stat.totalCarbonSavings) / 1e18, // Assuming 18 decimals
      }));
      setChartData(formattedData.reverse());
    }
  }, [data]);

  const loadMore = () => {
    fetchMore({
      variables: {
        skip: data.carbonSavingsStats.length
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          carbonSavingsStats: [...prev.carbonSavingsStats, ...fetchMoreResult.carbonSavingsStats]
        };
      }
    });
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Carbon Savings Dashboard</Text>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: chartData.map(d => d.timestamp),
            datasets: [{
              data: chartData.map(d => d.value)
            }]
          }}
          width={Dimensions.get('window').width - 16}
          height={220}
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Total Carbon Saved</Text>
        <Text style={styles.statsValue}>
          {data.carbonSavingsStats[0].totalCarbonSavings / 1e18} tons
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Total Contributions</Text>
        <Text style={styles.statsValue}>
          {data.carbonSavingsStats[0].count}
        </Text>
      </View>

      <Text style={styles.loadMore} onPress={loadMore}>
        Load More Data
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    color: '#4CAF50',
  },
  loadMore: {
    textAlign: 'center',
    color: '#2196F3',
    padding: 10,
    fontSize: 16,
  },
});