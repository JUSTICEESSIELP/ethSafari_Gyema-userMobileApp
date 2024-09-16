query AdvancedDeliveryFiltering($minCarbonSavings: BigInt!, $maxDistance: BigInt!, $after: String) {
    deliveries(
      first: 10,
      where: {
        totalCarbonSavings_gte: $minCarbonSavings,
        totalDistance_lte: $maxDistance,
        status: COMPLETED
      },
      orderBy: createdAt,
      orderDirection: desc,
      after: $after
    ) {
      id
      deliveryId
      customer {
        id
        totalCarbonSavings
      }
      contractAddress {
        id
      }
      pickupLocation
      dropoffLocation
      packageWeight
      totalDistance
      totalCarbonSavings
      createdAt
    }
  }
  
  # Query 2: Aggregated Carbon Savings Stats with time-based filtering
  query AggregatedCarbonSavingsStats($startTime: BigInt!, $endTime: BigInt!, $interval: Int8!) {
    carbonSavingsStats(
      where: {
        timestamp_gte: $startTime,
        timestamp_lt: $endTime
      },
      orderBy: timestamp,
      orderDirection: asc,
      interval: $interval
    ) {
      id
      timestamp
      totalCarbonSavings
      count
    }
  }
  
  # Query 3: Complex Account Query with related Deliveries and DeliveryLegs
  query ComplexAccountQuery($accountId: ID!, $minLegCarbonSavings: BigInt!) {
    account(id: $accountId) {
      id
      totalCarbonSavings
      isDriver
      deliveries(orderBy: createdAt, orderDirection: desc, first: 5) {
        id
        deliveryId
        status
        totalCarbonSavings
      }
      deliveryLegsAsDriver(
        where: { carbonSavings_gte: $minLegCarbonSavings },
        orderBy: carbonSavings,
        orderDirection: desc,
        first: 10
      ) {
        id
        delivery {
          id
          deliveryId
        }
        status
        startLocation
        endLocation
        distance
        carbonSavings
      }
    }
  }