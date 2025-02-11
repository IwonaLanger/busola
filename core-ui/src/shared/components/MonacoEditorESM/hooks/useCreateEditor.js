import { useEffect, useRef, useState } from 'react';
import { isEqual } from 'lodash';
import { editor, Uri } from 'monaco-editor';
import { useTheme } from 'shared/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export const useCreateEditor = ({
  value,
  options,
  setAutocompleteOptions,
  language,
  readOnly,
}) => {
  const { editorTheme } = useTheme();
  const descriptor = useRef(new Uri());
  const divRef = useRef(null);
  const { t } = useTranslation();

  const memoizedOptions = useRef({});
  if (!isEqual(memoizedOptions.current, options)) {
    memoizedOptions.current = options;
  }

  const [editorInstance, setEditorInstance] = useState(null);

  useEffect(() => {
    // setup Monaco editor and pass value updates to parent

    // calling this function sets up autocompletion
    const { modelUri } = setAutocompleteOptions();
    descriptor.current = modelUri;

    const model =
      editor.getModel(modelUri) ||
      editor.createModel(value, language, modelUri);

    // create editor and assign model with value and autocompletion
    const instance = editor.create(divRef.current, {
      model: model,
      automaticLayout: true,
      language: language,
      theme: editorTheme,
      fixedOverflowWidgets: true,
      readOnly: readOnly,
      scrollbar: {
        alwaysConsumeMouseWheel: false,
      },
      ...memoizedOptions.current,
    });

    setEditorInstance(instance);

    return () => {
      editor.getModel(descriptor.current)?.dispose();
      instance.dispose();
    };
    // missing dependencies: 'value'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    descriptor,
    editorTheme,
    setAutocompleteOptions,
    setEditorInstance,
    language,
    t,
    readOnly,
  ]);

  return { editorInstance, divRef, descriptor };
};
