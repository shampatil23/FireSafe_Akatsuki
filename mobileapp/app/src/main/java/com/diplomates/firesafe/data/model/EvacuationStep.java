package com.diplomates.firesafe.data.model;

public class EvacuationStep {
    private final int stepNumber;
    private final String instruction;
    private final int distanceMeters;
    private final boolean isHazardAvoidance;
    private final String safetyNote;

    public EvacuationStep(int stepNumber, String instruction, int distanceMeters,
                          boolean isHazardAvoidance, String safetyNote) {
        this.stepNumber = stepNumber;
        this.instruction = instruction;
        this.distanceMeters = distanceMeters;
        this.isHazardAvoidance = isHazardAvoidance;
        this.safetyNote = safetyNote;
    }

    public int getStepNumber() { return stepNumber; }
    public String getInstruction() { return instruction; }
    public int getDistanceMeters() { return distanceMeters; }
    public boolean isHazardAvoidance() { return isHazardAvoidance; }
    public String getSafetyNote() { return safetyNote; }
}
