#!/bin/bash

start_time=$(date +%s%N)

. "$(dirname "$0")/cmd-divider.sh"

# ANSI color codes
COLOR_RESET="\033[0m"
COLOR_WHITE="\033[37m"
COLOR_GRAY="\033[90m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"
COLOR_RED="\033[31m"
COLOR_CYAN="\033[36m"

# requirements
CURRENT_OS=$(uname)
MINIMUM_NODE_VERSION="v18.0.0"

# files
EXAMPLE_ENV_FILE=".env.example"
ENV_FILE=".env"
APPS_ROOT_DIR="apps"

_compare_version() {
  test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1";
}

_normalize_version() {
  local version="${1#v}"
  echo "$version"
}

_calculate_elapsed_time() {
  local start_time=$1
  local end_time=$2

  local elapsed_time_ms=$(( ($end_time - $start_time) / 1000000 ))
  echo "${elapsed_time_ms}ms"
}

initialize_project_setup() {
  echo "${COLOR_WHITE}\n🚧 Initializing project setup... ${COLOR_RESET}"

  cmd_divider
}

check_node_version() {
  echo "${COLOR_WHITE}\n🐢 Checking Node.js version... ${COLOR_RESET}"
  current_node_version=$(node -v)
  if [ $? -ne 0 ]; then
    echo "${COLOR_RED}❌ Node.js is not installed. ${COLOR_RESET}"
    echo "${COLOR_GRAY}👉 Please install Node.js $MINIMUM_NODE_VERSION or higher. ${COLOR_RESET}"
    echo "${COLOR_YELLOW}🔗 https://nodejs.org/en/download/prebuilt-binaries ${COLOR_RESET}\n"
    exit 1
  fi

  current_normalized_version=$(_normalize_version "$current_node_version")
  minimum_normalized_version=$(_normalize_version "$MINIMUM_NODE_VERSION")

  if _compare_version "$current_normalized_version" "$minimum_normalized_version"; then
    echo "${COLOR_GREEN}✅ Node.js is installed.${COLOR_RESET}"
    echo "${COLOR_GRAY}👉 Current version: ${current_node_version}${COLOR_RESET}"
  else
    echo "${COLOR_RED}❌ Node.js version is below the minimum required version.${COLOR_RESET}"
    echo "${COLOR_GRAY}👉 Minimum required version: $MINIMUM_NODE_VERSION${COLOR_RESET}"
    echo "${COLOR_GRAY}👉 Current version: $current_node_version${COLOR_RESET}\n"
    exit 1
  fi

  cmd_divider
}

check_pnpm() {
  echo "${COLOR_WHITE}\n📦 Checking pnpm...${COLOR_RESET}"
  PNPM_INSTALLED=$(pnpm -v)
  if [ $? -ne 0 ]; then
    echo "${COLOR_RED}❌ pnpm is not installed.${COLOR_RESET}"
    echo "${COLOR_GRAY}👉 Please install pnpm. ${COLOR_RESET}"
    echo "${COLOR_YELLOW}🔗 https://pnpm.io/installation ${COLOR_RESET}\n"
    exit 1
  else
    echo "${COLOR_GREEN}✅ pnpm is installed. ${COLOR_RESET}"
    echo "${COLOR_GRAY}👉 Current version: ${PNPM_INSTALLED} ${COLOR_RESET}"
  fi

  cmd_divider
}

install_dependencies() {
  echo "${COLOR_WHITE}\n📦 Installing project dependencies...${COLOR_RESET}"
  pnpm install
  if [ $? -ne 0 ]; then
    echo "${COLOR_RED}❌ Failed to install project dependencies. ${COLOR_RESET}\n"
    exit 1
  else
    echo "${COLOR_GREEN}✅ Project dependencies installed. ${COLOR_RESET}"
  fi

  cmd_divider
}

setup_husky() {
  echo "${COLOR_WHITE}\n🐺 Setting up husky...${COLOR_RESET}"
  pnpm prepare
  if [ $? -ne 0 ]; then
    echo "${COLOR_RED}❌ Failed to setup husky. ${COLOR_RESET}\n"
    exit 1
  else
    echo "${COLOR_GREEN}✅ Husky setup completed. ${COLOR_RESET}"
  fi

  chmod +x .husky/*
  if [ $? -ne 0 ]; then
    echo "${COLOR_RED}❌ Failed to make husky files executable. ${COLOR_RESET}\n"
    exit 1
  else
    echo "${COLOR_GREEN}✅ Husky files are executable. ${COLOR_RESET}"
  fi

  cmd_divider
}

setup_environment_variables() {
  echo "${COLOR_WHITE}\n🔑 Setting up environment variables. ${COLOR_RESET}"
  cp "$EXAMPLE_ENV_FILE" "$ENV_FILE"
  if [ $? -ne 0 ]; then
    echo "${COLOR_RED}❌ Failed to copy .env.example to .env. ${COLOR_RESET}\n"
    exit 1
  else
    echo "${COLOR_GREEN}✅ .env file setup completed. ${COLOR_RESET}"
  fi

  cmd_divider
}


create_symlink_for_env() {
  echo "${COLOR_WHITE}\n🔗 Creating symlink for .env in each app... ${COLOR_RESET}"
  apps_dir=$(find "$APPS_ROOT_DIR" -maxdepth 1 -mindepth 1 -type d)
  for app in $apps_dir; do
    if [ ! -L "$app/$ENV_FILE" ]; then
      if [ "$CURRENT_OS" = "Linux" ] || [ "$CURRENT_OS" = "Darwin" ]; then
        ln -s "../../$ENV_FILE" "$app/$ENV_FILE" # for mac/linux
      elif [ "$CURRENT_OS" = "WindowsNT" ]; then
        mklink "$app/$ENV_FILE" "../../$ENV_FILE" # for windows
      else # unsupported OS
        echo "${COLOR_RED}❌ Unsupported OS. ${COLOR_RESET}"
        echo "${COLOR_GRAY}👉 Please create a symlink for .env file in each app. ${COLOR_RESET}\n"
        exit 1
      fi
    fi
  done
  echo "${COLOR_GREEN}✅ .env symlink setup completed. ${COLOR_RESET}"
  echo "${COLOR_GRAY}🤓 Please fill the .env file with your environment variables. ${COLOR_RESET}"

  cmd_divider
}

end_time=$(date +%s%N)

print_project_setup_summary() {
  local elapsed_time=$(_calculate_elapsed_time "$start_time" "$end_time")

  echo "${COLOR_WHITE}\n🎉 Project setup completed. ${COLOR_RESET}"
  echo "${COLOR_GRAY}🕒 Elapsed time: ${elapsed_time} ${COLOR_RESET}"
  echo "${COLOR_GRAY}\n🚀 To run the project, execute ${COLOR_YELLOW}pnpm dev${COLOR_RESET} command."
  echo "${COLOR_GRAY}👉 For more commands, check ${COLOR_GREEN}package.json${COLOR_RESET} scripts."
  echo "${COLOR_GRAY}👉 For more information, check the ${COLOR_CYAN}README.md${COLOR_RESET} file.\n"
}

_setup() {
  initialize_project_setup
  check_node_version
  check_pnpm
  install_dependencies
  setup_husky
  # setup_environment_variables
  # create_symlink_for_env
  print_project_setup_summary
}

_setup