import PersonCard from "./PersonCard";
import { PersonalityPreview } from "../types/Personality";
import { Box, GridItem, Grid } from "@chakra-ui/react";

interface PersonsProps {
  persons: PersonalityPreview[];
}

const PersonList = ({ persons }: PersonsProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      padding="20px"
      // backgroundColor="rgba(0, 0, 0, 0.05)"
    >
      <Grid templateColumns="repeat(3, 1fr)" gap={4} width="100%" marginTop="20px">
        {persons.map((person) => (
          <GridItem key={person.id}>
            <PersonCard person={person} />
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default PersonList;
