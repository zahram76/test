import _ from "lodash"; // 4.17.5
import { _calculateGreatCircleDistance } from "./locationHelpers";
import React, { Component } from 'react';
import {Alert, AppState, StyleSheet, View, Text, PermissionsAndroid, Platform, AppRegistry} from "react-native";

const kalman = (location, lastLocation, constant) => {
  const accuracy = Math.max(location.accuracy, 1);
  const result = { ...location, ...lastLocation };

  if (!lastLocation) {
    result.variance = accuracy * accuracy;
  } else {
    const timestampInc =
      location.time.getTime() - lastLocation.time.getTime();

    if (timestampInc > 0) {
      // We can tune the velocity and particularly the coefficient at the end
      const velocity =
        _calculateGreatCircleDistance(location, lastLocation) /
        timestampInc *
        constant;
      result.variance += timestampInc * velocity * velocity / 1000;
    }

    const k = result.variance / (result.variance + accuracy * accuracy);
    result.latitude += k * (location.latitude - lastLocation.latitude);
    result.longitude += k * (location.longitude - lastLocation.longitude);
    result.variance = (1 - k) * result.variance;
  }

  return {
    ...location,
    ..._.pick(result, ["latitude", "longitude", "variance"])
  };
};

let lastLocation;
const runKalmanOnLocations = (rawData, kalmanConstant) => {
  //console.log('rowdata\n' + JSON.stringify(rawData))
  rawData
  .map(location => ({
    ...location,
    time: new Date(location.timestamp)
  }))
  .map(location => {
    lastLocation = kalman(
      location,
      lastLocation,
      kalmanConstant
    );
    
    console.log('last loc \n' + JSON.stringify(lastLocation))
    return JSON.stringify(lastLocation);
  });
}

export default runKalmanOnLocations;
