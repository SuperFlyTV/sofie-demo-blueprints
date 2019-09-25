#!/bin/bash

curl -ks --data-binary @$1 --header 'Content-Type:application/json' http://localhost:3000/ingest/studio0

echo "\n"
