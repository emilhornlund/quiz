#!/usr/bin/env sh

if ! command -v madge &> /dev/null
then
    echo "Madge is not installed. Please install it first."
    exit 1
fi

if [ -z "$1" ]; then
    echo "Usage: $0 <error_limit>"
    exit 1
fi

error_limit=$1

stderr_output=$(madge --circular --no-spinner --no-color --ts-config ./tsconfig.json --extensions ts,tsx ./src/index.tsx 2>&1 >/dev/null)

if echo "$stderr_output" | grep -q 'Found [0-9]\+ circular dependencies'; then
    circular_count=$(echo "$stderr_output" | grep -o 'Found [0-9]\+ circular dependencies' | grep -o '[0-9]\+')
else
    circular_count=0
fi

echo "Number of circular dependencies: $circular_count"

if [ "$circular_count" -gt "$error_limit" ]; then
    echo "Error: Circular dependency count ($circular_count) exceeds the limit ($error_limit)."
    exit 1
fi

echo "Circular dependency count is within the limit."
