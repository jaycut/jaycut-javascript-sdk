#!/bin/bash

while getopts ":o:" opt; do
    case $opt in
	o)  OFILE=$OPTARG;;
	\?) echo "$(basename $0): unknown option -- $OPTARG" >&2
	    exit 65;;
    esac
done

shift $(($OPTIND - 1))
if [ -z "$1" ]; then
    echo "Usage: $(basename "$0") [-o outfile] source [sources ...]"
    echo "Specify - as source to read from STDIN"
    exit 65
fi

# Using a temporary file lets us use stdin and multiple files easily
TEMP_FILE=mktemp
cat $@ > $TEMP_FILE

CLOSURE_URL=http://closure-compiler.appspot.com/compile
COMPILATION_LEVEL=WHITESPACE_ONLY
CURL_OPTS='-s'

COMMON_FIELDS="--data-urlencode js_code@$TEMP_FILE -d compilation_level=$COMPILATION_LEVEL"
COMPILE_FIELDS="-d output_info=compiled_code -d output_format=text"
TESTRUN_FIELDS="-d output_info=errors -d output_format=text"

ERRORS=`curl $CURL_OPTS $COMMON_FIELDS $TESTRUN_FIELDS $CLOSURE_URL`

if [ ! -z "$ERRORS" ]; then
    echo "There were errors compiling:" >&2
    echo $ERRORS >&2
    exit 1
fi

if [ -n "$OFILE" ]; then
    CURL_OPTS="$CURL_OPTS -o $OFILE"
fi

curl $CURL_OPTS $COMMON_FIELDS $COMPILE_FIELDS $CLOSURE_URL

rm $TEMP_FILE
