const checkSignificantInteractions = async (
    patientId,
    drugId,
    medicationId = null
  ) => {
    logger.info("Starting drug interaction check", {
      patientId,
      drugId,
      medicationId,
    });
  
    try {
      // Step 1: Fetch the patient's existing medications (exclude the medication being updated if applicable)
      logger.debug("Fetching existing medications for patient");
      const existingMedications = await medicationModel.find({
        patientId,
        _id: { $ne: medicationId }, // Exclude the medication being updated
      });
      logger.debug("Found existing medications", {
        count: existingMedications.length,
      });
  
      const existingDrugIds = [
        ...new Set(
          existingMedications
            .map((med) => med.drugId)
            .filter((id) => id && id !== drugId)
        ),
      ];
      logger.debug("Extracted existing drug IDs", {
        count: existingDrugIds.length,
      });
  
      let preExistingInteractionResult = {
        summary: "",
        drugs: [],
        metadata: {},
        interactions: [],
        filterCounts: {},
      };
      let hasPreExistingInteractions = false;
  
      if (
        existingDrugIds.length > 0 &&
        !preExistingInteractionResult.interactions
      ) {
        preExistingInteractionResult = await checkDrugInteractionsService(
          patientId,
          ...existingDrugIds
        );
        const { filterCounts } = preExistingInteractionResult;
        hasPreExistingInteractions = Object.values(filterCounts).some(
          (count) => count > 0
        );
      }
  
      // Check interactions with new drug
      const allDrugIds = [...existingDrugIds, drugId];
      let interactionResult = await checkDrugInteractionsService(
        patientId,
        ...allDrugIds
      );
  
      const { drugs, metadata, interactions, filterCounts } = interactionResult;
      const drugIds = metadata.drugList.split(",");
      const drugMap = Object.fromEntries(
        drugIds.map((id, idx) => [id, drugs[idx]?.drugName || id])
      );
  
      const newDrugName = drugMap[drugId];
      const filteredInteractions = interactions.filter((interaction) =>
        interaction.drugs.some(
          (drug) => drug.drugName.toLowerCase() === newDrugName.toLowerCase()
        )
      );
  
      // Optimize interaction filtering with parallel processing
      const [
        majorInteractions,
        moderateInteractions,
        minorInteractions,
        therapeuticDuplications,
      ] = await Promise.all([
        filteredInteractions
          .filter((i) => i.severity.toLowerCase() === "major")
          .map((i) => i.description),
        filteredInteractions
          .filter((i) => i.severity.toLowerCase() === "moderate")
          .map((i) => i.description),
        filteredInteractions
          .filter((i) => i.severity.toLowerCase() === "minor")
          .map((i) => i.description),
        filteredInteractions
          .filter((i) => i.severity.toLowerCase() === "therapeutic duplication")
          .map((i) => i.description),
      ]);
  
      let summary = "No significant interactions found with the new medication.";
      if (majorInteractions.length > 0) {
        summary = `Major interactions: ${majorInteractions.join(". ")}`;
      } else {
        const summaries = [];
        if (therapeuticDuplications.length)
          summaries.push(
            `Therapeutic duplications: ${therapeuticDuplications.join(". ")}`
          );
        if (moderateInteractions.length)
          summaries.push(
            `Moderate interactions: ${moderateInteractions.join(". ")}`
          );
        if (minorInteractions.length)
          summaries.push(`Minor interactions: ${minorInteractions.join(". ")}`);
        summary = summaries.join(". ") || summary;
      }
  
      const newDrugFilterCounts = {
        major: majorInteractions.length,
        moderate: moderateInteractions.length,
        minor: minorInteractions.length,
        food: filteredInteractions.filter(
          (i) => i.severity.toLowerCase() === "food"
        ).length,
        therapeuticDuplication: therapeuticDuplications.length,
      };
  
      const hasSignificantNewInteractions = Object.values(
        newDrugFilterCounts
      ).some((count) => count > 0);
  
      logger.info("Significant interactions check completed", {
        hasSignificantNewInteractions,
        newDrugFilterCounts,
      });
      return {
        hasSignificantNewInteractions,
        interactionResult: { summary },
        preExistingInteractionResult,
        hasPreExistingInteractions,
      };
    } catch (error) {
      logger.error("Error checking drug interactions", {
        error: error.message,
        patientId,
        drugId,
        medicationId,
      });
      throw error;
    }
  };