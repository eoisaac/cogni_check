#!/bin/bash

cmd_divider() {
  COLOR_GRAY="\033[90m"
  COLOR_RESET="\033[0m"

  local term_width=$(tput cols)
  local line_of_equals=$(printf "%${term_width}s" | tr ' ' '=')
  echo "\n${COLOR_GRAY}${line_of_equals}${COLOR_RESET}"
}