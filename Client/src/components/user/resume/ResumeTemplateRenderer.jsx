import React from "react";
import TemplateBasic from "./templates/TemplateBasic";
import TemplateNormal from "./templates/TemplateNormal";
import TemplateStandard from "./templates/TemplateStandard";
import TemplatePremium from "./templates/TemplatePremium";
import TemplateModern from "./templates/TemplateModern";

const TEMPLATE_MAP = {
  basic: { label: "Basic", Component: TemplateBasic },
  normal: { label: "Normal", Component: TemplateNormal },
  standard: { label: "Standard", Component: TemplateStandard },
  premium: { label: "Premium", Component: TemplatePremium },
  modern: { label: "Modern", Component: TemplateModern },
};

export function getResumeTemplates() {
  return Object.entries(TEMPLATE_MAP).map(([key, v]) => ({
    key,
    label: v.label,
  }));
}

export default function ResumeTemplateRenderer({ templateKey, resume, options }) {
  const picked = TEMPLATE_MAP[templateKey] || TEMPLATE_MAP.basic;
  const Template = picked.Component;
  return <Template resume={resume} options={options} />;
}


