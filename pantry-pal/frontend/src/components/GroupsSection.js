import React, { useState } from 'react';
import { Box, Container, Divider } from '@mui/material';
import StyledTitle from './StyledTitle';
import GroupInvites from './GroupInvites';
import MyGroups from './MyGroups';
import CreateGroup from './CreateGroup';

const GroupsSection = () => {
  const [groupInvites, setGroupInvites] = useState([]);
  const [myGroups, setMyGroups] = useState([]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ marginBottom: 6, textAlign: 'center' }}>
        <StyledTitle>Groups</StyledTitle>
      </Box>

      <Divider sx={{ marginBottom: 4 }} />
      <MyGroups myGroups={myGroups} />
      <Divider sx={{ marginBottom: 4, marginTop: 4 }} />
      <GroupInvites groupInvites={groupInvites} />
    </Container>
  );
};

export default GroupsSection;