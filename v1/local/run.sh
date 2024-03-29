#!/bin/sh
#Only dashisms allowed (https://wiki.archlinux.org/index.php/Dash).

DEFAULT_EVENT="event-bridge"
EVENT="${1:-$DEFAULT_EVENT}"

exists () {
  command -v "$1" >/dev/null 2>&1
}

check_cmd_exists () {
  local cmd="$1"
  local version="$2"
  local message="$3"

  if exists $cmd; then
    echo "The command \"$cmd\" is installed."
    "$cmd" "$version"
  else
    echo "The command \"$cmd\" is not installed. $message"
    exit 1
  fi
}

check_cmd_exists "docker" "--version" "Please install docker on your local system."

check_cmd_exists "sam" "--version" "Please install AWS SAM CLI via pip/pip3 (e.g. sudo pip3 install aws-sam-cli)."

echo "Testing \"$EVENT\" event..."
sam local invoke -e "./local/event/$EVENT.json" -t "./local/cfn/function.yaml" "Function" > "./local/output/$EVENT.json"