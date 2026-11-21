import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { FormField } from '../components/FormField';
import { FormModal } from '../components/FormModal';
import { Copy } from '../i18n/copy';

export function WorkspaceFormModal({
  visible,
  initialName = '',
  title,
  t,
  onSave,
  onClose,
}: {
  visible: boolean;
  initialName?: string;
  title: string;
  t: Copy;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | undefined>();

  const [lastVisible, setLastVisible] = useState(visible);
  if (visible !== lastVisible) {
    setLastVisible(visible);
    if (visible) {
      setName(initialName);
      setError(undefined);
    }
  }

  const handleSave = async () => {
    const clean = name.trim();
    if (!clean) {
      setError(t.requiredField);
      return;
    }
    await onSave(clean);
    onClose();
  };

  return (
    <FormModal visible={visible} title={title} isMobile={false} onClose={onClose}>
      <FormField
        label={t.workspaceName}
        placeholder={t.workspaceNamePlaceholder}
        value={name}
        onChangeText={(text) => { setName(text); setError(undefined); }}
        error={error}
        required
      />
      <PrimaryButton label={t.save} onPress={handleSave} />
      <SecondaryButton label={t.cancel} onPress={onClose} />
    </FormModal>
  );
}
