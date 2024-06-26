#!/bin/bash

# Example script that could be used in qbit to notify toloka2web about finished torrent
# The first argument is the torrent hash
TORRENT_HASH=$1

# API URL
URL="http://192.168.40.176/api/releases/state/${TORRENT_HASH}"

# Include the API key in the header
HEADER="X-API-Key: your_api_key_here"

# Debugging output before the request
echo "Making API call to: ${URL}"
echo "With header: ${HEADER}"

# Make the GET request and capture the output
RESPONSE=$(curl -s -H "${HEADER}" "${URL}")

# Debugging output after the request
echo "API Response:"
echo "${RESPONSE}"