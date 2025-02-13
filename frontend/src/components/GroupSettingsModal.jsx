import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bulma-components';

function GroupSettingsModal({ isOpen, setIsOpen, group, updateGroup, deleteGroup, navigate }) {
    const [groupName, setGroupName] = useState(group?.name || '');

    const handleUpdateGroup = () => {
        if (groupName.trim()) {
            updateGroup(group.id, { ...group, name: groupName });
            setIsOpen(false);
        }
    };

    const handleDeleteGroup = () => {
        deleteGroup(group.id);
        navigate('/groups');
    };

    return (
        <Modal show={isOpen} onClose={() => setIsOpen(false)}>
            <Modal.Card>
                <Modal.Card.Header>
                    <Modal.Card.Title>Group Settings</Modal.Card.Title>
                </Modal.Card.Header>
                <Modal.Card.Body>
                    <Form.Field>
                        <Form.Label>Group Name</Form.Label>
                        <Form.Control>
                            <Form.Input 
                                value={groupName} 
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </Form.Control>
                    </Form.Field>
                </Modal.Card.Body>
                <Modal.Card.Footer>
                    <Button color="success" onClick={handleUpdateGroup}>Save</Button>
                    <Button color="danger" onClick={handleDeleteGroup}>Delete Group</Button>
                    <Button onClick={() => setIsOpen(false)}>Cancel</Button>
                </Modal.Card.Footer>
            </Modal.Card>
        </Modal>
    );
}

export default GroupSettingsModal;
