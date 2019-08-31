const _toRadians = number => number * Math.PI / 180;

const _calculateGreatCircleDistance = (locationA, locationZ) => {
  const lat1 = locationA.latitude;
  const lon1 = locationA.longitude;
  const lat2 = locationZ.latitude;
  const lon2 = locationZ.longitude;

  // DOCUMENTATION: http://www.movable-type.co.uk/scripts/latlong.html
  const p1 = _toRadians(lat1);
  const p2 = _toRadians(lat2);
  const deltagamma = _toRadians(lon2 - lon1);
  const R = 6371e3; // gives d in metres
  const d =
    Math.acos(
      Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(deltagamma)
    ) * R;

  return isNaN(d) ? 0 : d;
}

export { _toRadians, _calculateGreatCircleDistance};