#!/usr/bin/env bash

# stop on errors
set -e;

echo -e "\033[0m\033[32m";
echo "   ___     _ _        _   _            _____                  __               POSTMAN  ";
echo "  / __|___| | |___ __| |_(_)___ _ _   |_   _| _ __ _ _ _  ___/ _|___ _ _ _ __  ___ _ _  ";
echo " | (__/ _ \ | / -_) _|  _| / _ \ ' \    | || '_/ _\` | ' \(_-<  _/ _ \ '_| '  \/ -_) '_|";
echo "  \___\___/_|_\___\__|\__|_\___/_||_|   |_||_| \__,_|_||_/__/_| \___/_| |_|_|_\___|_|   ";
echo "                                                                                        ";
echo -e "\033[0m\033[2m";
date;
echo "node `node -v`";
echo "npm  v`npm -v`";
echo -e "\033[0m\n";


# linting code
echo -e "\033[93mLinting and style-checking...\033[0m";
echo -en "\033[0m\033[2m";

# run jscs
echo -e "jscs v`jscs --version`\033[0m\n";
jscs index.js lib bin tests/unit

# run jshint
echo # blank line
jshint -v;
jshint index.js lib bin tests/unit --show-non-errors --verbose;

echo -n "No lint errors found.";

# run mocha tests
echo -e "\n\n\033[93mRunning unit tests...\033[0m";
echo -en "\033[0m\033[2mmocha `mocha --version`\033[0m";
mocha -t 10000 tests/unit/*-spec.js
