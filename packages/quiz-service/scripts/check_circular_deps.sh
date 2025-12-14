#!/usr/bin/env sh

error_limit=$1

stdout_output=$(npx madge --circular --no-spinner --no-color --ts-config ./tsconfig.json --extensions ts,tsx ./src/main.ts 2>&1)

circular_count=$(echo "$stdout_output" | grep -o 'Found [0-9]\+ circular dependencies' | grep -o '[0-9]\+' || echo "0")

echo "Number of circular dependencies: $circular_count"

# Show detailed dependency chains
if [ "$circular_count" -gt 0 ]; then
    echo "Circular dependency chains:"
    echo "$stdout_output" | sed -n '/Found [0-9]\+ circular dependencies/,$p' | tail -n +2
fi

if [ "$circular_count" -gt "$error_limit" ]; then
    echo "Error: Circular dependency count ($circular_count) exceeds the limit ($error_limit)."
    exit 1
fi

echo "Circular dependency count is within the limit."
