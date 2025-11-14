#!/bin/bash
# Rename all .js files containing JSX to .jsx

find pages layouts components -name "*.js" -type f | while read file; do
  if grep -qE "(return.*<|<[A-Z]|<div|<button|<input|<form|<select|<span|<p|<h|<Card|<Button|<Input|<Container)" "$file" 2>/dev/null; then
    newfile="${file%.js}.jsx"
    mv "$file" "$newfile"
    echo "Renamed: $file → $newfile"
  fi
done
