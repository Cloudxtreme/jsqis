// depends: jsqis-core.js
//          jsqis-view.js

// fixme: make it so more than one machine can be shown on a given slide

(function ($, jsqis) {
    // initialize QuantumBitMachineView's
    $(".jsqis-machine").each(function () {
        var machine = new jsqis.QuantumBitMachine($(this).data("qubits"), eval("(" + $(this).data("options") + ")")),
            machineView = new jsqis.QuantumBitMachineView(this, machine, eval("(" + $(this).data("view-options") + ")")),
            circuitViewContainer = $(this).data("circuit-view-container"),
            circuitView = null,
            operations,
            circuitOperations = [],
            gate = jsqis.gate;
        //// $(elt).data("machine", machine).data("machineView", machineView);

        // find all qubit operations
        //
        // http://stackoverflow.com/questions/8771463/jquery-find-what-order-does-it-return-elements-in
        //
        // NOTE: "As of jQuery 1.4 the results from .add() will always
        // be returned in document order (rather than a simple
        // concatenation)." (c.f. http://api.jquery.com/add/), so
        // machineSlide's operations are guaranteed to execute before
        // others in the below code.
        var machineSlide = $(this).parents('.slide').one();
        machineSlide.find('.slide').add(machineSlide).each(function () {
            if ($(this).hasClass("jsqis-gate")) {
                // determine the current operations
                with (gate) {
                    operations = eval($(this).data("operations"));
                }
                // determine the state after executing the current operations
                machine = machine.copy();
                machine.execute(operations);
                // determine which operations should be passed to the circuit diagram
                if (machineSlide[0] != $(this)[0]) { // don't display initialization operations in the circuit diagram
                    for (var i = 0; i < operations.length; ++i) {
                        // filter out no-op operations (rescale and globalPhase) before passing to circuit diagram
                        if (jsqis.gateRenderer[operations[i][0].name]) {
                            circuitOperations.push(operations[i]);
                        }
                    }
                }
            }
            $(this).data({machineState: machine, nOperations: circuitOperations.length});
        }).bind('deck.becameCurrent', function (event) {
            // update the machine's state
            machineView.update($(this).data("machineState"));
            // update the marker in the circuit view
            if (circuitView) {
                circuitView.update($(this).data("nOperations"));
            }
            // fixme: we really want the event to bubble, but not call
            // this same function again on the machineSlide ...
            event.stopPropagation();
        });

        // create a QuantumCircuitView if appropriate
        if (circuitViewContainer) {
            circuitView = new jsqis.QuantumCircuitView($(circuitViewContainer), machine.nQubits, circuitOperations, eval("(" + $(this).data("circuit-view-options") + ")"));
        }
    });
})(jQuery, jsqis);
// http://imakewebthings.com/deck.js/docs/#deck-core-theming
