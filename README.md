# Turing Machine

This is a turing machine simulator built with HTML, CSS, and JavaScript.

## How To Use

Visit https://hawksley.dev/turing-machine

There, you can input custom values for the following parameters to define the behaviour of the Turing machine:

- States - The list of possible states the machine can be in
- Tape Alphabet Symbols - The list of possible symbols the tape can contain
- Blank Symbol - The default symbol of the tape
- Input Symbols - The symbols that are placed on the tape initially, starting at position 0 and continuing right
- Initial State - The state that the turing machine starts off in

## Explanation

A Turing machine is a set of rules, states, and transitions, first described by Alan Turing in 1936.
They are very useful in the field of computer science since they are basic and simple to describe, yet capable of
implementing any given algorithm. According to the _Church-Turing thesis_, all computers are only as powerful as Turing
machines.

Turing machines consist of the following components:

- A fixed number of states, with one as the _start state_; a Turing machine is always in exactly one state
- An infinitely long tape in both directions, populated with _storage cells_ that can contain a value
- A defined _transition function_ that dictates how the Turing machine changes between states depending on the value of
  the _storage cells_
- An alphabet of all the characters the Turing machine can work with

There are some variations on Turing machines, such as a multi-tape machine, or a nondeterministic machine that takes
different branches based off chance. However, this program only simulates the most commonly used Turing machine.
